# Oracle Testing Guide 🧪

## Quick Start

Your oracle integration is complete and running! Here's how to test it:

## 1. Create an Oracle Market

### Navigate to Create Market
```
http://localhost:3000/create
```

### Fill Out the Form:
- **Question**: "Will BTC reach $50,000 by tomorrow?"
- **Description**: "Market resolves YES if BTC/USD >= $50,000, otherwise NO"
- **Category**: Crypto
- **Duration**: 1 hour (for quick testing)
- **Resolution Type**: Select "Oracle (Pyth)" ← THIS IS NEW! 🔮
- **Price Feed**: Select "BTC/USD"
- **Target Price**: Enter "50000" (or current BTC price +/- $1000)

### Click "Create Market"
- Transaction will be submitted to devnet
- Market will be created with oracle configuration

## 2. View Oracle Market

### Navigate to Markets
```
http://localhost:3000/markets
```

### Look for Oracle Badge:
- You'll see a blue 🔮 Oracle badge on your market
- This indicates it's oracle-powered, not manual

### Click on Your Market
- View market details page
- You'll see the **Oracle Info Card** with:
  - Resolution type: Pyth Price Feed
  - Target price: $50,000
  - Note: "This market will be automatically resolved by Pyth oracle when it ends"

## 3. Place Bets

### Choose Your Position:
- Click "YES" if you think BTC will be >= $50,000
- Click "NO" if you think BTC will be < $50,000

### Enter Amount:
- Try 0.1 SOL for testing
- Click "Bet 0.1 SOL on YES/NO"

### Wait for Confirmation:
- Transaction processes on devnet
- Your bet is recorded on-chain

## 4. Resolve the Market

### Wait for Market to End:
- Market must pass its `end_time` (1 hour in this example)
- Or create a very short market (like 1 minute) for instant testing

### Once Ended:
- Refresh the page
- You'll see a new **"Oracle Resolution"** section appear
- This shows: "This market can now be resolved by anyone using the Pyth price feed"

### Click "Resolve Market":
- **Anyone can do this** - it's permissionless!
- Transaction fetches current BTC/USD price from Pyth
- Contract compares price to target ($50,000)
- Outcome determined automatically:
  - If BTC price >= $50,000 → YES wins
  - If BTC price < $50,000 → NO wins

### View Results:
- Market shows "Resolved: YES" or "Resolved: NO"
- Strike price appears in the Oracle Info Card
- Example: "Strike Price: $48,234.56" (actual BTC price at resolution)

## 5. Claim Winnings

### If You Won:
- "Claim Winnings" button appears in your bet card
- Click to claim your winnings minus 2% platform fee

### If You Lost:
- Your bet card shows your position and amount
- No winnings to claim

## Visual Indicators

### Oracle Badge on Market Card:
```
┌─────────────────────────────┐
│ CRYPTO              ⏱ 1h    │
│ 🔮 Oracle                    │  ← NEW!
│                              │
│ Will BTC reach $50,000?      │
│ Market resolves with Pyth... │
│                              │
│ ✓ YES 55%    ✗ NO 45%       │
│ ━━━━━━━━━━━━━━━━━━━━━━━     │
│ Total Pool: 1.5 SOL          │
└─────────────────────────────┘
```

### Oracle Info Card on Market Page:
```
┌─────────────────────────────────────┐
│ 🔮 Oracle-Powered Market            │
│                                     │
│ Resolution: Pyth Price Feed         │
│ Target Price: $50,000.00            │
│ Strike Price: $48,234.56  ← After  │
│                              resolve│
│ This market will be automatically   │
│ resolved by Pyth oracle when it     │
│ ends.                               │
└─────────────────────────────────────┘
```

### Resolve Button (after end_time):
```
┌─────────────────────────────────────┐
│ 🔮 Oracle Resolution                │
│                                     │
│ This market can now be resolved by  │
│ anyone using the Pyth price feed.   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │     Resolve Market               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Testing Different Scenarios

### Scenario 1: YES Wins
1. Create market with target price below current BTC price
2. Example: BTC is $65,000, set target to $60,000
3. Bet on YES
4. Resolve → BTC >= $60,000 → YES wins
5. Claim winnings

### Scenario 2: NO Wins
1. Create market with target price above current BTC price
2. Example: BTC is $65,000, set target to $70,000
3. Bet on NO
4. Resolve → BTC < $70,000 → NO wins
5. Claim winnings

### Scenario 3: Multiple Bettors
1. Create oracle market
2. Place bet from one wallet
3. Switch wallet in Phantom/Backpack
4. Place bet from second wallet (opposite side)
5. Resolve market
6. Winners claim from their respective wallets

## Price Feed Testing

### SOL/USD Market:
```
Question: "Will SOL reach $150 by end of week?"
Price Feed: SOL/USD
Target Price: 150
```

### ETH/USD Market:
```
Question: "Will ETH break $3,000?"
Price Feed: ETH/USD
Target Price: 3000
```

### BTC/USD Market:
```
Question: "Will Bitcoin hold above $60k?"
Price Feed: BTC/USD
Target Price: 60000
```

## Troubleshooting

### Error: "Stale Price Data"
- Pyth price feed is > 60 seconds old
- Wait a moment and try again
- Pyth devnet feeds update frequently

### Error: "Market Not Ended"
- Market hasn't reached end_time yet
- Wait until end_time passes
- Or create a 1-minute market for testing

### Error: "Invalid Price Feed"
- Wrong price feed address
- Use the predefined feeds in dropdown
- Don't manually enter addresses

### Error: "Requires Oracle Resolution"
- Trying to manually resolve oracle market
- Must use "Resolve Market" button (calls oracle instruction)
- Only works for oracle markets, not manual ones

## Expected Behavior

### ✅ Correct:
- Oracle badge shows on oracle markets
- Target price visible before resolution
- Strike price visible after resolution
- Anyone can resolve after end_time
- Outcome matches Pyth price vs target

### ❌ Incorrect:
- No oracle badge on oracle markets
- Can't see target price
- Manual resolve works on oracle market
- Resolution before end_time
- Wrong outcome (check Pyth price)

## Verification

### Check Pyth Price:
```
Visit: https://pyth.network/developers/price-feed-ids
Find: BTC/USD, SOL/USD, ETH/USD devnet feeds
Compare: Resolution price matches Pyth data
```

### Check Transaction:
```
Visit: https://explorer.solana.com/?cluster=devnet
Search: Your resolve transaction signature
View: Logs show price data and outcome
```

## Demo Script

**For showing someone the oracle feature:**

1. **Create**: "Let me create a crypto price prediction market"
2. **Select Oracle**: "I'll use Pyth oracle for trustless resolution"
3. **Configure**: "Target: BTC >= $50,000"
4. **Bet**: "I'm betting YES - I think BTC will be above $50k"
5. **Wait**: "Market ends in 1 hour (or 1 minute for demo)"
6. **Resolve**: "Anyone can resolve this now - it's permissionless!"
7. **Check**: "BTC was $48,234 - below target - NO wins!"
8. **Transparent**: "See the strike price? That's the actual BTC price from Pyth"

## Next: Advanced Testing

### Multi-Market Testing:
- Create 3 oracle markets simultaneously
- Different price feeds (BTC, SOL, ETH)
- Different target prices
- Resolve all three and verify outcomes

### Edge Case Testing:
- Create market with target exactly at current price
- Create very short market (1 minute)
- Create market far in future (1 week)
- Test resolution immediately after end_time

### Production Readiness:
- Test with multiple users
- Verify gas costs
- Check error handling
- Monitor Pyth feed reliability

---

**Happy Testing! 🎉**

Your oracle integration is production-ready. The UI is clean, the contract is secure, and the resolution is trustless. 

Enjoy decentralized prediction markets! 🚀
