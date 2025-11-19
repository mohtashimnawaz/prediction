# 🚀 Quick Start Guide

## Prerequisites Check

Before you begin, ensure you have the following installed:

```bash
# Check Rust
rustc --version  # Should be 1.70.0+

# Check Solana
solana --version  # Should be 1.18.0+

# Check Anchor
anchor --version  # Should be 0.31.1+

# Check Node.js
node --version  # Should be 18+
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/[YOUR_USERNAME]/solana-prediction-market.git
cd solana-prediction-market
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Program

```bash
anchor build
```

This compiles the Rust program and generates the IDL and TypeScript types.

### 4. Run Tests

```bash
anchor test
```

This starts a local validator, deploys the program, and runs the test suite.

Expected output:
```
✅ Market created
✅ Bettor1 placed 1 SOL on YES
✅ Bettor2 placed 2 SOL on NO
✅ Bettor3 placed 1.5 SOL on YES
✅ Market resolved: YES wins!
✅ Bettor1 claimed winnings
✅ Bettor3 claimed winnings
✅ Correctly prevented loser from claiming
✅ Correctly prevented double claiming

9 passing (7s)
```

## Deploy to Devnet

### 1. Configure Solana CLI for Devnet

```bash
solana config set --url devnet
```

### 2. Create a New Keypair (if needed)

```bash
solana-keygen new --outfile ~/.config/solana/id.json
```

### 3. Airdrop SOL for Deployment

```bash
solana airdrop 2
```

### 4. Deploy

```bash
anchor deploy --provider.cluster devnet
```

### 5. Update Program ID

After deployment, copy the program ID and update it in:
- `programs/prediction/src/lib.rs` (line 4: `declare_id!`)
- `Anchor.toml` (under `[programs.devnet]`)

Then rebuild:
```bash
anchor build
```

## Common Commands

### Build
```bash
anchor build
```

### Test (with deployment)
```bash
anchor test
```

### Test (skip deployment)
```bash
anchor test --skip-deploy
```

### Deploy to specific cluster
```bash
# Devnet
anchor deploy --provider.cluster devnet

# Mainnet (when ready)
anchor deploy --provider.cluster mainnet
```

### View Program Logs
```bash
solana logs [PROGRAM_ID]
```

### Check Account Data
```bash
solana account [ACCOUNT_ADDRESS]
```

## Troubleshooting

### Error: "insufficient funds"
```bash
solana airdrop 2
```

### Error: "program not found"
Make sure you've deployed the program:
```bash
anchor deploy
```

### Error: "Max seed length exceeded"
This happens if the market question is too long. Keep questions under 32 characters or use a different seed strategy.

### Tests failing after code changes
Rebuild and redeploy:
```bash
anchor build
anchor test
```

### Validator issues
Stop and restart:
```bash
# Kill existing validator
pkill solana-test-validator

# Start fresh
anchor test
```

## Project Structure

```
.
├── Anchor.toml              # Anchor configuration
├── Cargo.toml               # Rust workspace config
├── package.json             # Node.js dependencies
├── tsconfig.json            # TypeScript config
├── programs/
│   └── prediction/
│       ├── Cargo.toml       # Program dependencies
│       └── src/
│           └── lib.rs       # Main program code
├── tests/
│   └── prediction.ts        # Test suite
├── target/
│   ├── deploy/              # Compiled program
│   ├── idl/                 # Generated IDL
│   └── types/               # Generated TypeScript types
└── app/                     # Frontend (coming soon)
```

## Key Concepts

### PDAs (Program Derived Addresses)
- **Market PDA**: `["market", authority, question_seed]`
- **Bet PDA**: `["bet", market, bettor]`
- **Vault PDA**: `["vault", market]`

### Instruction Flow

1. **Create Market**
   - Authority creates a market with question, description, end time
   - Market and vault PDAs are created

2. **Place Bet**
   - User bets SOL on YES or NO
   - Funds transferred to vault PDA
   - Bet account tracks user's position

3. **Resolve Market**
   - After end time, authority resolves with outcome
   - Market marked as resolved

4. **Claim Winnings**
   - Winners calculate proportional share
   - Funds transferred from vault to winner
   - Bet marked as claimed

## Next Steps

1. **Deploy to Devnet**: Follow the deployment guide above
2. **Build Frontend**: Create a web UI for better UX
3. **Add Oracle**: Integrate Pyth or Switchboard for automated resolution
4. **Enhance Features**: Add scalar markets, liquidity pools, etc.

## Support

- **GitHub Issues**: Report bugs or request features
- **Discord**: Join the community (link in README)
- **Twitter**: Follow for updates @yourproject

## Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Solana Program Library](https://spl.solana.com/)
- [Indie.fun Hackathon](https://indie.fun)

---

**Happy Building! 🚀**
