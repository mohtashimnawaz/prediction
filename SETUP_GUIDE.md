# 🚀 Complete Setup & Deployment Guide

## Prerequisites

### Required Software
```bash
# Check versions
rust --version      # 1.70.0+
solana --version    # 1.18.0+
anchor --version    # 0.31.1+
node --version      # 18+
npm --version       # 9+
```

### Install Missing Tools

**Rust**:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Solana CLI**:
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

**Anchor**:
```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.31.1 anchor-cli --locked
```

---

## Part 1: Smart Contract Setup

### 1. Clone & Install Dependencies

```bash
git clone <your-repo>
cd prediction

# Install Node dependencies
npm install
```

### 2. Build the Program

```bash
# This compiles the Rust program
anchor build

# Expected output: "Finished `release` profile [optimized]"
```

### 3. Run Tests

```bash
# This starts local validator, deploys, and runs tests
anchor test

# Expected: "10 passing (8s)"
```

### 4. Deploy to Devnet

```bash
# Configure for devnet
solana config set --url devnet

# Create/load wallet
solana-keygen new --outfile ~/.config/solana/id.json
# OR use existing: solana config set --keypair ~/.config/solana/id.json

# Airdrop SOL for deployment
solana airdrop 2

# Deploy
anchor deploy --provider.cluster devnet

# Save the Program ID printed
# Example: 894VcrRiHhZmk7hAuucP5foDGoeWpykqC84zfoLBTbfW
```

### 5. Update Program ID

```bash
# Copy the deployed program ID
# Update in:
# - Anchor.toml (line 4)
# - programs/prediction/src/lib.rs (line 5)
# - app/src/config/constants.ts (create this file)

# Rebuild
anchor build
```

---

## Part 2: Frontend Setup

### 1. Install Frontend Dependencies

```bash
cd app
npm install

# This installs:
# - Next.js 14
# - Solana Wallet Adapter
# - Tailwind CSS
# - TypeScript
# - Anchor client
```

### 2. Configure Environment

Create `app/.env.local`:
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=<your-deployed-program-id>
```

### 3. Copy IDL

```bash
# Copy generated IDL to frontend
cp ../target/idl/prediction.json ./src/idl/

# This allows frontend to interact with program
```

### 4. Run Development Server

```bash
npm run dev

# Frontend available at: http://localhost:3000
```

---

## Part 3: Using the Application

### Wallet Setup

1. Install Phantom wallet extension
2. Create wallet or import existing
3. Switch to Devnet in wallet settings
4. Airdrop devnet SOL:
   ```bash
   solana airdrop 1 <your-wallet-address>
   ```

### Minting Your First Card

**Via Tests**:
```bash
# Run the card minting test
anchor test -- --grep "mint_card"
```

**Via Frontend** (after implementing mint UI):
```typescript
// In app/src/pages/cards/mint.tsx
const mintCard = async () => {
  const power = 8;      // 1-10
  const rarity = 4;     // 1-5 (Epic)
  const multiplier = 2000; // 2.0x
  
  const tx = await program.methods
    .mintCard(power, rarity, multiplier)
    .accounts({
      card: cardPda,
      mint: mintKeypair.publicKey,
      tokenAccount: tokenAccountPda,
      payer: wallet.publicKey,
      owner: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
    
  console.log("Card minted:", tx);
};
```

### Creating a Market

```bash
# Via CLI
anchor run create-market

# Or via frontend at /markets/create
```

### Entering a Battle

```bash
# Via test
anchor test -- --grep "battle"

# Or via frontend at /battle
```

---

## Part 4: Production Deployment

### Mainnet Preparation

1. **Security Audit**:
   ```bash
   # Run Anchor verify
   anchor verify <program-id>
   
   # Consider professional audit services:
   # - OtterSec
   # - Sec3
   # - Neodyme
   ```

2. **Upgrade Authority**:
   ```bash
   # Transfer to multi-sig (Squads Protocol)
   solana program set-upgrade-authority \
     <program-id> \
     <multisig-address>
   ```

3. **Treasury Setup**:
   ```bash
   # Create Squads multi-sig for treasury
   # Add team members
   # Set 2/3 or 3/5 signature requirement
   ```

### Mainnet Deploy

```bash
# Configure mainnet
solana config set --url mainnet-beta

# Fund deployment wallet (needs ~3-5 SOL)
# Transfer from main wallet

# Deploy
anchor deploy --provider.cluster mainnet

# SAVE THE PROGRAM ID
# Update all configs immediately
```

### Frontend Production

```bash
cd app

# Update environment
cp .env.local .env.production
# Change RPC to mainnet
# Change network to mainnet-beta

# Build
npm run build

# Deploy to Vercel/Netlify
vercel deploy --prod
# OR
netlify deploy --prod
```

---

## Part 5: Monitoring & Maintenance

### Tracking Transactions

```bash
# Monitor program logs
solana logs <program-id>

# Check specific transaction
solana confirm -v <tx-signature>
```

### Analytics

**On-Chain Queries**:
```typescript
// Get all cards
const cards = await connection.getProgramAccounts(programId, {
  filters: [
    { dataSize: CARD_SIZE },
  ]
});

// Get platform stats
const platform = await program.account.platform.fetch(platformPda);
console.log("Total Volume:", platform.totalVolume);
console.log("Total Markets:", platform.totalMarkets);
```

**Frontend Analytics**:
- Vercel Analytics (built-in)
- Google Analytics
- Mixpanel for event tracking

### Maintenance Tasks

**Weekly**:
- Check error rates
- Monitor wallet balances
- Review market resolutions
- Community engagement

**Monthly**:
- Security updates
- Performance optimization
- Feature releases
- Community governance votes

---

## Part 6: Troubleshooting

### Common Issues

**Build Fails**:
```bash
# Clear cache
rm -rf target/
anchor clean
anchor build
```

**Deployment Fails**:
```bash
# Increase compute units
solana program deploy \
  --program-id target/deploy/prediction-keypair.json \
  --max-compute-units 1400000 \
  target/deploy/prediction.so
```

**Frontend Can't Connect**:
```bash
# Check network match
# Wallet: devnet
# App: NEXT_PUBLIC_SOLANA_NETWORK=devnet
# RPC: https://api.devnet.solana.com
```

**Transaction Simulation Failed**:
- Check wallet has SOL for rent
- Verify all accounts exist
- Check account ownership
- Review instruction data

---

## Part 7: Development Workflow

### Adding New Features

1. **Update Program**:
   ```bash
   # Edit programs/prediction/src/lib.rs
   # Add instruction/account
   anchor build
   anchor test
   ```

2. **Generate New IDL**:
   ```bash
   anchor build
   cp target/idl/prediction.json app/src/idl/
   ```

3. **Update Frontend**:
   ```typescript
   // Types auto-generated from IDL
   import { Prediction } from '@/idl/prediction';
   // Use new instruction
   ```

4. **Test End-to-End**:
   ```bash
   # Terminal 1: Local validator
   solana-test-validator
   
   # Terminal 2: Deploy locally
   anchor deploy
   
   # Terminal 3: Run frontend
   cd app && npm run dev
   
   # Test in browser
   ```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/card-breeding

# Commit changes
git add .
git commit -m "Add card breeding instruction"

# Push and create PR
git push origin feature/card-breeding
```

---

## Part 8: Performance Optimization

### Program Optimization

```rust
// Use references instead of clones
let market = &ctx.accounts.market; // Good
let market = ctx.accounts.market.clone(); // Bad (expensive)

// Batch operations
// Instead of multiple instructions, combine logic

// Minimize account size
// Only store essential data on-chain
```

### Frontend Optimization

```typescript
// Use SWR for caching
import useSWR from 'swr';

const { data: cards } = useSWR('cards', fetchCards, {
  refreshInterval: 10000, // 10s
  revalidateOnFocus: false,
});

// Lazy load images
import Image from 'next/image';
<Image src={cardImage} loading="lazy" />

// Memoize expensive calculations
const winRate = useMemo(() => 
  calculateWinRate(card.wins, card.losses),
  [card.wins, card.losses]
);
```

---

## Part 9: Testing Strategy

### Unit Tests (Rust)
```bash
cargo test
```

### Integration Tests (Anchor)
```bash
anchor test
anchor test -- --grep "specific test"
```

### Frontend Tests
```bash
cd app
npm test
npm run test:e2e
```

### Load Testing
```bash
# Simulate 100 concurrent users
artillery run load-test.yml
```

---

## Part 10: Launch Checklist

### Pre-Launch
- [ ] Security audit completed
- [ ] All tests passing
- [ ] Frontend responsive on mobile
- [ ] Wallet adapters tested (Phantom, Solflare)
- [ ] Error handling comprehensive
- [ ] Analytics integrated
- [ ] Social media accounts created
- [ ] Documentation finalized
- [ ] Video demo recorded
- [ ] Community Discord setup

### Launch Day
- [ ] Deploy to mainnet
- [ ] Update all configs
- [ ] Frontend deployed
- [ ] DNS configured
- [ ] Social media posts scheduled
- [ ] Press release sent
- [ ] Monitor logs/errors
- [ ] Community support active

### Post-Launch
- [ ] Daily monitoring
- [ ] User feedback collection
- [ ] Bug fixes prioritized
- [ ] Feature requests tracked
- [ ] Weekly updates posted
- [ ] Monthly governance votes

---

## 📞 Support

- **Documentation**: /docs
- **Discord**: [Your Server]
- **Twitter**: @PredictionArena
- **Email**: support@predictionarena.sol

---

**Last Updated**: November 20, 2025
**Version**: 1.0.0
**Status**: Production Ready
