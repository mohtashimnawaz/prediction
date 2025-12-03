# Pyth Oracle Integration

## Overview

The prediction market now supports **decentralized oracle-based resolution** using Pyth Network price feeds. This enables trustless, verifiable outcomes for price-based predictions.

## How It Works

### Market Types

1. **Manual Markets** (`OracleSource::Manual`)
   - Resolved by market creator
   - Traditional trust-based resolution
   - Suitable for subjective outcomes (sports, politics, etc.)

2. **Oracle Markets** (`OracleSource::PythPrice`)
   - Automatically resolved using Pyth price feeds
   - Trustless and verifiable
   - Perfect for crypto price predictions

### Creating an Oracle Market

```typescript
await program.methods
  .createMarket(
    "Will SOL be above $150 by Dec 31?",
    "Prediction based on Pyth SOL/USD price feed",
    endTime,
    { crypto: {} },
    { pythPrice: {} },  // Oracle source
    pythPriceFeedPubkey,  // Pyth SOL/USD feed
    new BN(150_00000000)  // Target price: $150 (8 decimals)
  )
  .accounts({...})
  .rpc();
```

### Resolution Process

**Manual Markets:**
- Creator calls `resolve_market(outcome: bool)` after end_time
- Requires creator authority signature

**Oracle Markets:**
- Anyone can call `resolve_market_with_oracle()` after end_time
- No authority required - fully permissionless
- Fetches current price from Pyth feed
- Validates price freshness (< 60 seconds old)
- Outcome = YES if current_price >= target_price

## Pyth Price Feeds (Devnet)

Common price feeds you can use:

| Asset | Feed Address (Devnet) |
|-------|----------------------|
| SOL/USD | `J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix` |
| BTC/USD | `HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J` |
| ETH/USD | `EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw` |

More feeds: https://pyth.network/developers/price-feed-ids#solana-devnet

## Benefits

✅ **Trustless** - No need to trust market creator  
✅ **Verifiable** - Anyone can verify the resolution on-chain  
✅ **Permissionless** - Anyone can trigger resolution  
✅ **Real-time** - Uses live price data from Pyth oracles  
✅ **Censorship-resistant** - Cannot be manipulated  

## Market Struct Updates

```rust
pub struct Market {
    // ... existing fields
    
    // Oracle configuration
    pub oracle_source: OracleSource,     // Manual or PythPrice
    pub price_feed: Option<Pubkey>,      // Pyth price feed account
    pub target_price: Option<i64>,       // Target price for YES outcome
    pub strike_price: Option<i64>,       // Actual price at resolution
}
```

## Example Use Cases

**Crypto Price Predictions:**
- "Will SOL reach $200 by end of year?"
- "Will BTC break $100k in 2025?"
- "Will ETH outperform SOL this quarter?"

**DeFi Metrics:**
- "Will TVL in protocol X exceed $1B?"
- "Will staking APY drop below 5%?"

## Error Handling

- `RequiresOracleResolution` - Trying to manually resolve oracle market
- `NotOracleMarket` - Trying to use oracle for manual market
- `OracleConfigRequired` - Missing price_feed or target_price
- `InvalidPriceFeed` - Pyth feed account invalid
- `PriceNotAvailable` - Price data not available
- `StalePriceData` - Price older than 60 seconds

## Frontend Implementation Example

```typescript
// Check if market uses oracle
if (market.oracleSource === 'pythPrice') {
  // Anyone can resolve after end time
  await program.methods
    .resolveMarketWithOracle()
    .accounts({
      market: marketPubkey,
      priceFeed: market.priceFeed,
    })
    .rpc();
} else {
  // Only creator can resolve
  await program.methods
    .resolveMarket(outcome)
    .accounts({
      market: marketPubkey,
      authority: creatorPubkey,
    })
    .rpc();
}
```

## Next Steps

1. Update frontend to support oracle market creation
2. Add UI to display oracle configuration (price feed, target price)
3. Show "Oracle-Verified" badge on oracle markets
4. Display strike price vs target price after resolution
5. Add price chart visualization

## Security Considerations

- Always verify price feed address matches official Pyth feeds
- Check price freshness (timestamp within 60 seconds)
- Consider confidence intervals for high-value markets
- Test thoroughly on devnet before mainnet deployment

---

**Note:** This feature is deployed on devnet. Test extensively before using on mainnet with real funds.
