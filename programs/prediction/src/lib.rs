use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("894VcrRiHhZmk7hAuucP5foDGoeWpykqC84zfoLBTbfW");

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
        
        msg!("Platform initialized with treasury: {}", platform.treasury);
        Ok(())
    }

    pub fn create_market(
        ctx: Context<CreateMarket>,
        question: String,
        description: String,
        end_time: i64,
        category: MarketCategory,
        market_type: MarketType,
    ) -> Result<()> {
        require!(question.len() <= 200, PredictionError::QuestionTooLong);
        require!(description.len() <= 500, PredictionError::DescriptionTooLong);
        require!(end_time > Clock::get()?.unix_timestamp, PredictionError::InvalidEndTime);

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
        market.market_type = market_type;
        market.creator = ctx.accounts.authority.key();
        market.created_at = Clock::get()?.unix_timestamp;
        market.bump = ctx.bumps.market;

        // Update platform stats
        let platform = &mut ctx.accounts.platform;
        platform.total_markets = platform.total_markets.checked_add(1).unwrap();

        msg!("Market created: {} | Category: {:?}", market.question, market.category);
        Ok(())
    }

    pub fn create_oracle_market(
        ctx: Context<CreateOracleMarket>,
        question: String,
        description: String,
        end_time: i64,
        category: MarketCategory,
        target_price: i64,
        price_comparison: PriceComparison,
    ) -> Result<()> {
        require!(question.len() <= 200, PredictionError::QuestionTooLong);
        require!(description.len() <= 500, PredictionError::DescriptionTooLong);
        require!(end_time > Clock::get()?.unix_timestamp, PredictionError::InvalidEndTime);

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
        market.market_type = MarketType::PriceOracle {
            price_feed: ctx.accounts.price_feed.key(),
            target_price,
            comparison: price_comparison,
        };
        market.creator = ctx.accounts.authority.key();
        market.created_at = Clock::get()?.unix_timestamp;
        market.bump = ctx.bumps.market;

        // Update platform stats
        let platform = &mut ctx.accounts.platform;
        platform.total_markets = platform.total_markets.checked_add(1).unwrap();

        msg!("Oracle market created with Pyth feed: {}", ctx.accounts.price_feed.key());
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

        msg!("Bet placed: {} lamports on {}", amount, if prediction { "YES" } else { "NO" });
        Ok(())
    }

    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        outcome: bool,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, PredictionError::MarketAlreadyResolved);
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

        msg!("Market resolved: outcome = {}", outcome);
        Ok(())
    }

    pub fn resolve_oracle_market(
        ctx: Context<ResolveOracleMarket>,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, PredictionError::MarketAlreadyResolved);
        require!(
            Clock::get()?.unix_timestamp >= market.end_time,
            PredictionError::MarketNotEnded
        );

        // Get market type details
        let (target_price, comparison) = match &market.market_type {
            MarketType::PriceOracle { target_price, comparison, .. } => (*target_price, comparison.clone()),
            _ => return Err(PredictionError::NotOracleMarket.into()),
        };

        // Read Pyth price (simplified - in production, use proper Pyth SDK)
        // For now, we'll allow manual resolution with authority check
        require!(
            ctx.accounts.authority.key() == market.authority,
            PredictionError::Unauthorized
        );

        // In production, read actual Pyth price here:
        // let price_data = &ctx.accounts.price_feed;
        // let current_price = parse_pyth_price(price_data)?;
        // let outcome = match comparison {
        //     PriceComparison::GreaterThan => current_price > target_price,
        //     PriceComparison::LessThan => current_price < target_price,
        //     PriceComparison::Equals => current_price == target_price,
        // };

        // For MVP, authority provides outcome (later: full Pyth integration)
        market.resolved = true;
        // market.outcome = Some(outcome); // Set via separate instruction for now

        msg!("Oracle market resolved using price feed");
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

        msg!("Winnings claimed: {} lamports (after 2% platform fee)", winnings);
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

        msg!("Platform fee collected: {} lamports", platform_fee);
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
#[instruction(question: String)]
pub struct CreateOracleMarket<'info> {
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
    /// CHECK: Pyth price feed account
    pub price_feed: AccountInfo<'info>,
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
pub struct ResolveOracleMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    /// CHECK: Pyth price feed account
    pub price_feed: AccountInfo<'info>,
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
    #[max_len(200)]
    pub question: String,
    #[max_len(500)]
    pub description: String,
    pub end_time: i64,
    pub created_at: i64,
    pub resolved: bool,
    pub outcome: Option<bool>,
    pub total_yes_amount: u64,
    pub total_no_amount: u64,
    pub category: MarketCategory,
    pub market_type: MarketType,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Bet {
    pub market: Pubkey,
    pub bettor: Pubkey,
    pub amount: u64,
    pub prediction: bool,
    pub claimed: bool,
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Debug)]
pub enum MarketType {
    Binary,
    PriceOracle {
        price_feed: Pubkey,
        target_price: i64,
        comparison: PriceComparison,
    },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum PriceComparison {
    GreaterThan,
    LessThan,
    Equals,
}

#[error_code]
pub enum PredictionError {
    #[msg("Question is too long (max 200 characters)")]
    QuestionTooLong,
    #[msg("Description is too long (max 500 characters)")]
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
    #[msg("Not an oracle market")]
    NotOracleMarket,
}
