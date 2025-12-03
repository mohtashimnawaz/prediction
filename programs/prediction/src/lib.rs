use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token, Mint, TokenAccount, MintTo};
use anchor_spl::associated_token::AssociatedToken;
use pyth_sdk_solana::state::load_price_account;

declare_id!("ocKzKFLEt9dWXtPmD1xQSvGgA7ugaFFkGv4oXnWNa2N");

const PLATFORM_FEE_BPS: u64 = 200; // 2% platform fee

#[program]
pub mod prediction {
    use super::*;

    pub fn initialize_platform(ctx: Context<InitializePlatform>) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        platform.authority = ctx.accounts.authority.key();
        platform.treasury = ctx.accounts.treasury.key();
        platform.total_markets = 0;
        platform.total_volume = 0;
        platform.bump = ctx.bumps.platform;
        
        Ok(())
    }

    pub fn create_market(
        ctx: Context<CreateMarket>,
        question: String,
        description: String,
        end_time: i64,
        category: MarketCategory,
        oracle_source: OracleSource,
        oracle_data_type: OracleDataType,
        // Price oracles
        price_feed: Option<Pubkey>,
        target_price: Option<i64>,
        // Sports oracles
        game_id: Option<String>,
        target_spread: Option<i32>,
        // Weather oracles
        location: Option<String>,
        weather_metric: Option<WeatherMetric>,
        target_value: Option<i64>,
        // Social/Custom oracles
        data_identifier: Option<String>,
        metric_type: Option<MetricType>,
        threshold: Option<u64>,
    ) -> Result<()> {
        require!(question.len() <= 100, PredictionError::QuestionTooLong);
        require!(description.len() <= 200, PredictionError::DescriptionTooLong);
        require!(end_time > Clock::get()?.unix_timestamp, PredictionError::InvalidEndTime);

        // Validate oracle configuration based on type
        match oracle_data_type {
            OracleDataType::Price => {
                require!(price_feed.is_some(), PredictionError::OracleConfigRequired);
                require!(target_price.is_some(), PredictionError::OracleConfigRequired);
            },
            OracleDataType::SportsScore | OracleDataType::SportsWinner => {
                require!(game_id.is_some(), PredictionError::OracleConfigRequired);
            },
            OracleDataType::Weather => {
                require!(location.is_some(), PredictionError::OracleConfigRequired);
                require!(weather_metric.is_some(), PredictionError::OracleConfigRequired);
                require!(target_value.is_some(), PredictionError::OracleConfigRequired);
            },
            OracleDataType::Social | OracleDataType::BoxOffice | OracleDataType::Custom => {
                require!(data_identifier.is_some(), PredictionError::OracleConfigRequired);
                require!(threshold.is_some(), PredictionError::OracleConfigRequired);
            },
            OracleDataType::None => {
                // Manual market - no oracle validation needed
            }
        }

        let market = &mut ctx.accounts.market;
        market.authority = ctx.accounts.authority.key();
        market.question = question;
        market.description = description;
        market.end_time = end_time;
        market.resolved = false;
        market.outcome = None;
        market.total_yes_amount = 0;
        market.total_no_amount = 0;
        market.category = category;
        market.creator = ctx.accounts.authority.key();
        market.created_at = Clock::get()?.unix_timestamp;
        market.bump = ctx.bumps.market;
        
        // Oracle configuration
        market.oracle_source = oracle_source;
        market.oracle_data_type = oracle_data_type;
        
        // Price oracle fields
        market.price_feed = price_feed;
        market.target_price = target_price;
        market.strike_price = None;
        
        // Sports oracle fields
        market.game_id = game_id;
        market.team_a_score = None;
        market.team_b_score = None;
        market.target_spread = target_spread;
        
        // Weather oracle fields
        market.location = location;
        market.weather_metric = weather_metric.unwrap_or_default();
        market.target_value = target_value;
        market.recorded_value = None;
        
        // Social/Custom oracle fields
        market.data_identifier = data_identifier;
        market.metric_type = metric_type.unwrap_or_default();
        market.threshold = threshold;
        market.actual_value = None;

        // Update platform stats
        let platform = &mut ctx.accounts.platform;
        platform.total_markets = platform.total_markets.checked_add(1).unwrap();

        Ok(())
    }

    pub fn place_bet(
        ctx: Context<PlaceBet>,
        amount: u64,
        prediction: bool,
    ) -> Result<()> {
        require!(amount > 0, PredictionError::InvalidAmount);
        
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, PredictionError::MarketAlreadyResolved);
        require!(Clock::get()?.unix_timestamp < market.end_time, PredictionError::MarketEnded);

        // Transfer SOL from bettor to market vault
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.bettor.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        // Update market totals (running totals for performance)
        if prediction {
            market.total_yes_amount = market.total_yes_amount.checked_add(amount).unwrap();
        } else {
            market.total_no_amount = market.total_no_amount.checked_add(amount).unwrap();
        }

        // Initialize or update bet account
        let bet = &mut ctx.accounts.bet;
        bet.market = market.key();
        bet.bettor = ctx.accounts.bettor.key();
        bet.amount = bet.amount.checked_add(amount).unwrap();
        bet.prediction = prediction;
        bet.claimed = false;

        // Update platform volume
        let platform = &mut ctx.accounts.platform;
        platform.total_volume = platform.total_volume.checked_add(amount).unwrap();

        Ok(())
    }

    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        outcome: bool,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, PredictionError::MarketAlreadyResolved);
        require!(
            market.oracle_source == OracleSource::Manual,
            PredictionError::RequiresOracleResolution
        );
        require!(
            ctx.accounts.authority.key() == market.authority,
            PredictionError::Unauthorized
        );
        require!(
            Clock::get()?.unix_timestamp >= market.end_time,
            PredictionError::MarketNotEnded
        );

        market.resolved = true;
        market.outcome = Some(outcome);

        Ok(())
    }

    pub fn resolve_market_with_oracle(
        ctx: Context<ResolveMarketWithOracle>,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, PredictionError::MarketAlreadyResolved);
        require!(
            market.oracle_source == OracleSource::PythPrice,
            PredictionError::NotOracleMarket
        );
        require!(
            Clock::get()?.unix_timestamp >= market.end_time,
            PredictionError::MarketNotEnded
        );

        // Load and validate Pyth price feed
        let price_feed_data = &ctx.accounts.price_feed.try_borrow_data()
            .map_err(|_| PredictionError::InvalidPriceFeed)?;
        let price_account: &pyth_sdk_solana::state::PriceAccount = load_price_account(price_feed_data.as_ref())
            .map_err(|_| PredictionError::InvalidPriceFeed)?;
        
        // Get current price
        let current_price = price_account.agg.price;
        let publish_time = price_account.timestamp;

        // Verify price is recent (within 60 seconds)
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            current_time - publish_time <= 60,
            PredictionError::StalePriceData
        );

        // Store the actual price at resolution time
        market.strike_price = Some(current_price);
        
        // Determine outcome: YES if current price >= target price
        let target = market.target_price.unwrap();
        let outcome = current_price >= target;

        market.resolved = true;
        market.outcome = Some(outcome);

        Ok(())
    }

    // Resolve sports market with oracle data
    pub fn resolve_market_sports(
        ctx: Context<ResolveMarketSports>,
        team_a_score: u32,
        team_b_score: u32,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, PredictionError::MarketAlreadyResolved);
        require!(
            market.oracle_data_type == OracleDataType::SportsScore || 
            market.oracle_data_type == OracleDataType::SportsWinner,
            PredictionError::NotOracleMarket
        );
        require!(
            Clock::get()?.unix_timestamp >= market.end_time,
            PredictionError::MarketNotEnded
        );

        // Store actual scores
        market.team_a_score = Some(team_a_score);
        market.team_b_score = Some(team_b_score);

        // Determine outcome based on market type
        let outcome = if market.oracle_data_type == OracleDataType::SportsWinner {
            // Simple winner: Team A wins
            team_a_score > team_b_score
        } else if let Some(spread) = market.target_spread {
            // Spread betting: Team A covers spread
            (team_a_score as i32 - team_b_score as i32) >= spread
        } else {
            // Over/Under total score
            let total_score = team_a_score + team_b_score;
            if let Some(target) = market.target_value {
                total_score as i64 >= target
            } else {
                team_a_score > team_b_score
            }
        };

        market.resolved = true;
        market.outcome = Some(outcome);

        Ok(())
    }

    // Resolve weather market with oracle data
    pub fn resolve_market_weather(
        ctx: Context<ResolveMarketWeather>,
        recorded_value: i64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, PredictionError::MarketAlreadyResolved);
        require!(
            market.oracle_data_type == OracleDataType::Weather,
            PredictionError::NotOracleMarket
        );
        require!(
            Clock::get()?.unix_timestamp >= market.end_time,
            PredictionError::MarketNotEnded
        );

        // Store recorded weather value
        market.recorded_value = Some(recorded_value);

        // Determine outcome: YES if recorded value >= target
        let target = market.target_value
            .ok_or(PredictionError::OracleConfigRequired)?;
        let outcome = recorded_value >= target;

        market.resolved = true;
        market.outcome = Some(outcome);

        Ok(())
    }

    // Resolve social/entertainment market with oracle data
    pub fn resolve_market_social(
        ctx: Context<ResolveMarketSocial>,
        actual_value: u64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, PredictionError::MarketAlreadyResolved);
        require!(
            market.oracle_data_type == OracleDataType::Social ||
            market.oracle_data_type == OracleDataType::BoxOffice ||
            market.oracle_data_type == OracleDataType::Custom,
            PredictionError::NotOracleMarket
        );
        require!(
            Clock::get()?.unix_timestamp >= market.end_time,
            PredictionError::MarketNotEnded
        );

        // Store actual value (followers, likes, box office, etc.)
        market.actual_value = Some(actual_value);

        // Determine outcome: YES if actual >= threshold
        let threshold = market.threshold
            .ok_or(PredictionError::OracleConfigRequired)?;
        let outcome = actual_value >= threshold;

        market.resolved = true;
        market.outcome = Some(outcome);

        Ok(())
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let market = &ctx.accounts.market;
        let bet = &mut ctx.accounts.bet;

        require!(market.resolved, PredictionError::MarketNotResolved);
        require!(!bet.claimed, PredictionError::AlreadyClaimed);
        require!(bet.bettor == ctx.accounts.bettor.key(), PredictionError::Unauthorized);

        let outcome = market.outcome.unwrap();
        require!(bet.prediction == outcome, PredictionError::LosingBet);

        // Calculate winnings with platform fee
        let total_pool = market.total_yes_amount.checked_add(market.total_no_amount).unwrap();
        let winning_pool = if outcome {
            market.total_yes_amount
        } else {
            market.total_no_amount
        };

        require!(winning_pool > 0, PredictionError::NoWinningBets);

        // Calculate platform fee (2%)
        let platform_fee = total_pool
            .checked_mul(PLATFORM_FEE_BPS).unwrap()
            .checked_div(10000).unwrap();
        
        let pool_after_fee = total_pool.checked_sub(platform_fee).unwrap();

        // Calculate user's proportional winnings
        let winnings = (bet.amount as u128)
            .checked_mul(pool_after_fee as u128).unwrap()
            .checked_div(winning_pool as u128).unwrap() as u64;

        // Transfer winnings from vault to bettor
        let market_key = market.key();
        let bump = ctx.bumps.vault;
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"vault",
            market_key.as_ref(),
            &[bump],
        ]];

        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.vault.key(),
            &ctx.accounts.bettor.key(),
            winnings,
        );

        anchor_lang::solana_program::program::invoke_signed(
            &transfer_ix,
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.bettor.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            signer_seeds,
        )?;

        bet.claimed = true;

        Ok(())
    }

    pub fn collect_platform_fee(ctx: Context<CollectPlatformFee>) -> Result<()> {
        let market = &ctx.accounts.market;
        require!(market.resolved, PredictionError::MarketNotResolved);

        let platform = &ctx.accounts.platform;
        require!(
            ctx.accounts.authority.key() == platform.authority,
            PredictionError::Unauthorized
        );

        // Calculate platform fee
        let total_pool = market.total_yes_amount.checked_add(market.total_no_amount).unwrap();
        let platform_fee = total_pool
            .checked_mul(PLATFORM_FEE_BPS).unwrap()
            .checked_div(10000).unwrap();

        // Transfer fee from vault to treasury
        let market_key = market.key();
        let bump = ctx.bumps.vault;
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"vault",
            market_key.as_ref(),
            &[bump],
        ]];

        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.vault.key(),
            &platform.treasury,
            platform_fee,
        );

        anchor_lang::solana_program::program::invoke_signed(
            &transfer_ix,
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.treasury.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            signer_seeds,
        )?;

        Ok(())
    }

    pub fn mint_card(
        ctx: Context<MintCard>,
        power: u8,
        rarity: u8,
        multiplier: u64,
    ) -> Result<()> {
        // Mint 1 token to the owner's token account (NFT standard: supply = 1)
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, 1)?;

        // Store card metadata on-chain
        let card = &mut ctx.accounts.card;
        card.mint = ctx.accounts.mint.key();
        card.owner = ctx.accounts.owner.key();
        card.power = power;
        card.rarity = rarity;
        card.multiplier = multiplier;
        card.wins = 0;
        card.losses = 0;
        card.bump = ctx.bumps.card;

        Ok(())
    }

    pub fn battle(
        ctx: Context<Battle>,
        amount: u64,
        prediction: bool,
    ) -> Result<()> {
        require!(amount > 0, PredictionError::InvalidAmount);
        
        let market = &mut ctx.accounts.market;
        let card = &ctx.accounts.card;
        
        // Verify card ownership via token account
        require!(
            ctx.accounts.card_token_account.amount == 1,
            PredictionError::NotCardOwner
        );
        require!(
            ctx.accounts.card_token_account.owner == ctx.accounts.player.key(),
            PredictionError::NotCardOwner
        );
        
        require!(!market.resolved, PredictionError::MarketAlreadyResolved);
        require!(Clock::get()?.unix_timestamp < market.end_time, PredictionError::MarketEnded);

        // Transfer SOL from player to market vault
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.player.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        // Update market totals
        if prediction {
            market.total_yes_amount = market.total_yes_amount.checked_add(amount).unwrap();
        } else {
            market.total_no_amount = market.total_no_amount.checked_add(amount).unwrap();
        }

        // Initialize or update bet account with card multiplier
        let bet = &mut ctx.accounts.bet;
        bet.market = market.key();
        bet.bettor = ctx.accounts.player.key();
        bet.amount = bet.amount.checked_add(amount).unwrap();
        bet.prediction = prediction;
        bet.claimed = false;
        bet.card_mint = Some(card.mint);
        bet.card_multiplier = card.multiplier;

        // Update platform volume
        let platform = &mut ctx.accounts.platform;
        platform.total_volume = platform.total_volume.checked_add(amount).unwrap();

        Ok(())
    }

    pub fn update_card_stats(
        ctx: Context<UpdateCardStats>,
        won: bool,
    ) -> Result<()> {
        let card = &mut ctx.accounts.card;
        
        // Verify card ownership
        require!(
            ctx.accounts.card_token_account.amount == 1,
            PredictionError::NotCardOwner
        );
        require!(
            ctx.accounts.card_token_account.owner == ctx.accounts.owner.key(),
            PredictionError::NotCardOwner
        );
        
        if won {
            card.wins = card.wins.checked_add(1).unwrap();
        } else {
            card.losses = card.losses.checked_add(1).unwrap();
        }
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Platform::INIT_SPACE,
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,
    /// CHECK: Treasury can be any account
    pub treasury: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(question: String)]
pub struct CreateMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Market::INIT_SPACE,
        seeds = [b"market", authority.key().as_ref(), &question.as_bytes()[..question.len().min(32)]],
        bump
    )]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub platform: Account<'info, Platform>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub platform: Account<'info, Platform>,
    #[account(
        init_if_needed,
        payer = bettor,
        space = 8 + Bet::INIT_SPACE,
        seeds = [b"bet", market.key().as_ref(), bettor.key().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,
    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump
    )]
    /// CHECK: Vault PDA for holding bets
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    pub bettor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResolveMarketWithOracle<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    /// CHECK: Pyth price feed account, validated in instruction
    pub price_feed: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ResolveMarketSports<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResolveMarketWeather<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResolveMarketSocial<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub bet: Account<'info, Bet>,
    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump
    )]
    /// CHECK: Vault PDA for holding bets
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    pub bettor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CollectPlatformFee<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub platform: Account<'info, Platform>,
    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump
    )]
    /// CHECK: Vault PDA for holding bets
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: Treasury account from platform
    pub treasury: AccountInfo<'info>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Battle<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub platform: Account<'info, Platform>,
    pub card: Account<'info, Card>,
    #[account(
        constraint = card_token_account.mint == card.mint,
        constraint = card_token_account.owner == player.key()
    )]
    pub card_token_account: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = player,
        space = 8 + Bet::INIT_SPACE,
        seeds = [b"bet", market.key().as_ref(), player.key().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,
    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump
    )]
    /// CHECK: Vault PDA for holding bets
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateCardStats<'info> {
    #[account(mut)]
    pub card: Account<'info, Card>,
    #[account(
        constraint = card_token_account.mint == card.mint,
        constraint = card_token_account.owner == owner.key()
    )]
    pub card_token_account: Account<'info, TokenAccount>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct MintCard<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + Card::INIT_SPACE,
        seeds = [b"card", mint.key().as_ref()],
        bump
    )]
    pub card: Account<'info, Card>,
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = payer,
        mint::freeze_authority = payer,
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Card {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub power: u8,
    pub rarity: u8,
    pub multiplier: u64,
    pub wins: u64,
    pub losses: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Platform {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub total_markets: u64,
    pub total_volume: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub authority: Pubkey,
    pub creator: Pubkey,
    #[max_len(100)]
    pub question: String,
    #[max_len(200)]
    pub description: String,
    pub end_time: i64,
    pub created_at: i64,
    pub resolved: bool,
    pub outcome: Option<bool>,
    pub total_yes_amount: u64,
    pub total_no_amount: u64,
    pub category: MarketCategory,
    pub bump: u8,
    
    // Oracle configuration
    pub oracle_source: OracleSource,
    pub oracle_data_type: OracleDataType,
    
    // Price-based oracles (Pyth, Chainlink, Switchboard)
    pub price_feed: Option<Pubkey>,
    pub target_price: Option<i64>,
    pub strike_price: Option<i64>,
    
    // Sports oracles
    #[max_len(50)]
    pub game_id: Option<String>,           // e.g., "LAL-GSW-2024-12-04"
    pub team_a_score: Option<u32>,
    pub team_b_score: Option<u32>,
    pub target_spread: Option<i32>,        // Point spread or score threshold
    
    // Weather oracles
    #[max_len(50)]
    pub location: Option<String>,          // e.g., "New York, NY"
    pub weather_metric: WeatherMetric,
    pub target_value: Option<i64>,        // Temperature, precipitation, etc.
    pub recorded_value: Option<i64>,      // Actual value at resolution
    
    // Social/Custom oracles
    #[max_len(100)]
    pub data_identifier: Option<String>,   // Tweet ID, movie ID, etc.
    pub metric_type: MetricType,
    pub threshold: Option<u64>,            // Follower count, box office $, etc.
    pub actual_value: Option<u64>,         // Recorded value
}

#[account]
#[derive(InitSpace)]
pub struct Bet {
    pub market: Pubkey,
    pub bettor: Pubkey,
    pub amount: u64,
    pub prediction: bool,
    pub claimed: bool,
    pub card_mint: Option<Pubkey>,
    pub card_multiplier: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Default, Debug)]
pub enum OracleSource {
    #[default]
    Manual,              // Manual resolution by creator
    PythPrice,           // Pyth Network price feeds (crypto, stocks, forex)
    ChainlinkPrice,      // Chainlink price feeds
    ChainlinkSports,     // Chainlink Sports data (game scores, winners)
    ChainlinkWeather,    // Chainlink Weather data (temperature, precipitation)
    SwitchboardPrice,    // Switchboard price feeds
    SwitchboardCustom,   // Custom Switchboard feeds (social, entertainment)
    CustomApi,           // Custom API endpoint with verification
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Default, Debug)]
pub enum OracleDataType {
    #[default]
    None,           // Manual markets
    Price,          // Crypto/stock/commodity prices
    SportsScore,    // Sports game scores
    SportsWinner,   // Tournament/game winner
    Weather,        // Weather conditions
    Social,         // Social media metrics
    BoxOffice,      // Movie earnings
    Custom,         // Custom data point
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Default, Debug)]
pub enum WeatherMetric {
    #[default]
    None,
    Temperature,     // In Fahrenheit * 100
    Precipitation,   // In inches * 100
    WindSpeed,       // In mph * 100
    Humidity,        // Percentage * 100
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Default, Debug)]
pub enum MetricType {
    #[default]
    None,
    FollowerCount,   // Social media followers
    LikeCount,       // Tweet/post likes
    ViewCount,       // Video views
    BoxOfficeGross,  // Movie earnings in cents
    StreamRank,      // Streaming platform ranking
    Custom,          // Custom metric
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum MarketCategory {
    Sports,
    Crypto,
    Politics,
    Entertainment,
    Weather,
    Technology,
    Gaming,
    Other,
}

#[error_code]
pub enum PredictionError {
    #[msg("Question is too long (max 100 characters)")]
    QuestionTooLong,
    #[msg("Description is too long (max 200 characters)")]
    DescriptionTooLong,
    #[msg("End time must be in the future")]
    InvalidEndTime,
    #[msg("Invalid bet amount")]
    InvalidAmount,
    #[msg("Market has already been resolved")]
    MarketAlreadyResolved,
    #[msg("Market betting period has ended")]
    MarketEnded,
    #[msg("Market has not been resolved yet")]
    MarketNotResolved,
    #[msg("Winnings already claimed")]
    AlreadyClaimed,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Market betting period has not ended")]
    MarketNotEnded,
    #[msg("This is a losing bet")]
    LosingBet,
    #[msg("No winning bets in this market")]
    NoWinningBets,
    #[msg("Not the card owner")]
    NotCardOwner,
    #[msg("Market requires oracle resolution")]
    RequiresOracleResolution,
    #[msg("Market is not configured for oracle resolution")]
    NotOracleMarket,
    #[msg("Oracle configuration (price_feed and target_price) is required")]
    OracleConfigRequired,
    #[msg("Invalid Pyth price feed")]
    InvalidPriceFeed,
    #[msg("Price data not available")]
    PriceNotAvailable,
    #[msg("Price data is stale (older than 60 seconds)")]
    StalePriceData,
}
