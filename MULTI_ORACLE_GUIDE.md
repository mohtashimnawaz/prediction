# Multi-Oracle Integration Guide 🌐

## Overview

Your prediction market platform now supports **8 oracle types** for automated, trustless resolution across multiple data sources:

1. **Manual** - Creator resolves (original)
2. **Pyth Price** - Crypto/stock/forex prices ✅ IMPLEMENTED
3. **Chainlink Price** - Alternative price feeds
4. **Chainlink Sports** - Sports scores and winners
5. **Chainlink Weather** - Weather conditions
6. **Switchboard Price** - Switchboard price feeds
7. **Switchboard Custom** - Social media, entertainment
8. **Custom API** - Any verifiable data source

## Smart Contract Architecture

### New Enums

```rust
pub enum OracleSource {
    Manual,              // Manual resolution
    PythPrice,           // Pyth Network (crypto, stocks, forex)
    ChainlinkPrice,      // Chainlink price feeds
    ChainlinkSports,     // Sports scores/winners
    ChainlinkWeather,    // Weather data
    SwitchboardPrice,    // Switchboard prices
    SwitchboardCustom,   // Social/entertainment
    CustomApi,           // Custom endpoints
}

pub enum OracleDataType {
    None,           // Manual markets
    Price,          // Crypto/stock prices
    SportsScore,    // Game scores
    SportsWinner,   // Tournament winners
    Weather,        // Weather conditions
    Social,         // Social media metrics
    BoxOffice,      // Movie earnings
    Custom,         // Custom data
}

pub enum WeatherMetric {
    None,
    Temperature,     // Fahrenheit * 100
    Precipitation,   // Inches * 100
    WindSpeed,       // MPH * 100
    Humidity,        // Percentage * 100
}

pub enum MetricType {
    None,
    FollowerCount,   // Social media followers
    LikeCount,       // Post likes
    ViewCount,       // Video views
    BoxOfficeGross,  // Movie earnings (cents)
    StreamRank,      // Platform ranking
    Custom,          // Custom metric
}
```

### Extended Market Struct

```rust
pub struct Market {
    // ... existing fields ...
    
    // Oracle configuration
    pub oracle_source: OracleSource,
    pub oracle_data_type: OracleDataType,
    
    // Price oracles (Pyth, Chainlink, Switchboard)
    pub price_feed: Option<Pubkey>,
    pub target_price: Option<i64>,
    pub strike_price: Option<i64>,
    
    // Sports oracles
    pub game_id: Option<String>,           // "LAL-GSW-2024-12-04"
    pub team_a_score: Option<u32>,
    pub team_b_score: Option<u32>,
    pub target_spread: Option<i32>,        // Point spread
    
    // Weather oracles
    pub location: Option<String>,          // "New York, NY"
    pub weather_metric: WeatherMetric,
    pub target_value: Option<i64>,
    pub recorded_value: Option<i64>,
    
    // Social/Custom oracles
    pub data_identifier: Option<String>,   // Tweet ID, movie ID
    pub metric_type: MetricType,
    pub threshold: Option<u64>,
    pub actual_value: Option<u64>,
}
```

### Resolution Instructions

```rust
// 1. Price oracles (Pyth - already working)
pub fn resolve_market_with_oracle(
    ctx: Context<ResolveMarketWithOracle>
) -> Result<()>

// 2. Sports oracles (Chainlink Sports)
pub fn resolve_market_sports(
    ctx: Context<ResolveMarketSports>,
    team_a_score: u32,
    team_b_score: u32,
) -> Result<()>

// 3. Weather oracles (Chainlink Weather)
pub fn resolve_market_weather(
    ctx: Context<ResolveMarketWeather>,
    recorded_value: i64,
) -> Result<()>

// 4. Social/Entertainment oracles
pub fn resolve_market_social(
    ctx: Context<ResolveMarketSocial>,
    actual_value: u64,
) -> Result<()>
```

## Use Cases by Oracle Type

### 1. Price Oracles (Pyth, Chainlink, Switchboard)

**Crypto Prices:**
```typescript
{
  question: "Will BTC reach $100k by Dec 31?",
  oracleSource: "PythPrice",
  oracleDataType: "Price",
  priceFeed: "BTC/USD_FEED_ADDRESS",
  targetPrice: 100000 * 1e8  // $100,000
}
```

**Stock Prices:**
```typescript
{
  question: "Will AAPL hit $200?",
  oracleSource: "PythPrice",
  oracleDataType: "Price",
  priceFeed: "AAPL/USD_FEED_ADDRESS",
  targetPrice: 200 * 1e8  // $200
}
```

**Forex:**
```typescript
{
  question: "Will EUR/USD exceed 1.10?",
  oracleSource: "ChainlinkPrice",
  oracleDataType: "Price",
  priceFeed: "EUR/USD_FEED_ADDRESS",
  targetPrice: 1.10 * 1e8
}
```

### 2. Sports Oracles (Chainlink Sports)

**Game Winner:**
```typescript
{
  question: "Will the Lakers beat the Warriors?",
  oracleSource: "ChainlinkSports",
  oracleDataType: "SportsWinner",
  gameId: "LAL-GSW-2024-12-04"
  // Resolves YES if team_a_score > team_b_score
}
```

**Point Spread:**
```typescript
{
  question: "Will Cowboys beat Eagles by 7+?",
  oracleSource: "ChainlinkSports",
  oracleDataType: "SportsScore",
  gameId: "DAL-PHI-2024-12-10",
  targetSpread: 7  // Cowboys by 7 points
}
```

**Over/Under:**
```typescript
{
  question: "Will total score exceed 45 points?",
  oracleSource: "ChainlinkSports",
  oracleDataType: "SportsScore",
  gameId: "KC-BUF-2024-12-15",
  targetValue: 45  // Total points threshold
}
```

### 3. Weather Oracles (Chainlink Weather)

**Temperature:**
```typescript
{
  question: "Will NYC exceed 90°F tomorrow?",
  oracleSource: "ChainlinkWeather",
  oracleDataType: "Weather",
  location: "New York, NY",
  weatherMetric: "Temperature",
  targetValue: 9000  // 90°F * 100
}
```

**Precipitation:**
```typescript
{
  question: "Will Miami get 2+ inches of rain?",
  oracleSource: "ChainlinkWeather",
  oracleDataType: "Weather",
  location: "Miami, FL",
  weatherMetric: "Precipitation",
  targetValue: 200  // 2 inches * 100
}
```

**Wind Speed:**
```typescript
{
  question: "Will wind speed exceed 50 mph?",
  oracleSource: "ChainlinkWeather",
  oracleDataType: "Weather",
  location: "Chicago, IL",
  weatherMetric: "WindSpeed",
  targetValue: 5000  // 50 mph * 100
}
```

### 4. Social Media Oracles (Switchboard)

**Twitter Followers:**
```typescript
{
  question: "Will @elonmusk hit 200M followers?",
  oracleSource: "SwitchboardCustom",
  oracleDataType: "Social",
  dataIdentifier: "elonmusk",  // Twitter handle
  metricType: "FollowerCount",
  threshold: 200000000
}
```

**Tweet Likes:**
```typescript
{
  question: "Will this tweet get 1M+ likes?",
  oracleSource: "SwitchboardCustom",
  oracleDataType: "Social",
  dataIdentifier: "1234567890123456789",  // Tweet ID
  metricType: "LikeCount",
  threshold: 1000000
}
```

**YouTube Views:**
```typescript
{
  question: "Will MrBeast video hit 100M views?",
  oracleSource: "SwitchboardCustom",
  oracleDataType: "Social",
  dataIdentifier: "dQw4w9WgXcQ",  // Video ID
  metricType: "ViewCount",
  threshold: 100000000
}
```

### 5. Entertainment Oracles (Switchboard)

**Box Office:**
```typescript
{
  question: "Will Avengers 6 gross $1B opening weekend?",
  oracleSource: "SwitchboardCustom",
  oracleDataType: "BoxOffice",
  dataIdentifier: "avengers-6-2025",  // Movie ID
  metricType: "BoxOfficeGross",
  threshold: 100000000000  // $1B in cents
}
```

**Streaming Rank:**
```typescript
{
  question: "Will Stranger Things stay #1 on Netflix?",
  oracleSource: "SwitchboardCustom",
  oracleDataType: "Custom",
  dataIdentifier: "stranger-things-s5",
  metricType: "StreamRank",
  threshold: 1  // Rank #1
}
```

## Frontend Implementation

### Multi-Oracle Create Form

```typescript
const ORACLE_CONFIGS = {
  price: {
    name: "Price Feed",
    sources: ["PythPrice", "ChainlinkPrice", "SwitchboardPrice"],
    feeds: {
      PythPrice: [
        { symbol: "BTC/USD", address: "..." },
        { symbol: "ETH/USD", address: "..." },
        { symbol: "SOL/USD", address: "..." },
      ]
    },
    fields: ["priceFeed", "targetPrice"]
  },
  
  sports: {
    name: "Sports Score",
    sources: ["ChainlinkSports"],
    fields: ["gameId", "targetSpread"],
    games: [
      { id: "LAL-GSW-2024-12-04", name: "Lakers vs Warriors" },
      { id: "DAL-PHI-2024-12-10", name: "Cowboys vs Eagles" },
    ]
  },
  
  weather: {
    name: "Weather Data",
    sources: ["ChainlinkWeather"],
    fields: ["location", "weatherMetric", "targetValue"],
    metrics: ["Temperature", "Precipitation", "WindSpeed", "Humidity"]
  },
  
  social: {
    name: "Social Media",
    sources: ["SwitchboardCustom"],
    fields: ["dataIdentifier", "metricType", "threshold"],
    metrics: ["FollowerCount", "LikeCount", "ViewCount"]
  },
  
  entertainment: {
    name: "Entertainment",
    sources: ["SwitchboardCustom"],
    fields: ["dataIdentifier", "metricType", "threshold"],
    metrics: ["BoxOfficeGross", "StreamRank"]
  }
};
```

### Resolution Handlers

```typescript
// Sports resolution
const resolveSports = async (marketPubkey, teamAScore, teamBScore) => {
  await program.methods
    .resolveMarketSports(teamAScore, teamBScore)
    .accounts({
      market: marketPubkey,
      authority: publicKey,
    })
    .rpc();
};

// Weather resolution
const resolveWeather = async (marketPubkey, recordedValue) => {
  await program.methods
    .resolveMarketWeather(recordedValue)
    .accounts({
      market: marketPubkey,
      authority: publicKey,
    })
    .rpc();
};

// Social resolution
const resolveSocial = async (marketPubkey, actualValue) => {
  await program.methods
    .resolveMarketSocial(actualValue)
    .accounts({
      market: marketPubkey,
      authority: publicKey,
    })
    .rpc();
};
```

## Oracle Integration Phases

### Phase 1: Crypto Prices ✅ COMPLETE
- **Status**: Deployed and working
- **Oracle**: Pyth Network
- **Markets**: BTC/USD, ETH/USD, SOL/USD
- **Resolution**: Fully automated on-chain

### Phase 2: Sports + Weather (NEXT)
**Sports Integration:**
1. Add Chainlink Sports oracle adapter
2. Integrate TheRundown API for game data
3. Create sports market templates (NFL, NBA, MLB, Soccer)
4. Add score verification and dispute mechanism

**Weather Integration:**
1. Add Chainlink Weather oracle adapter
2. Integrate AccuWeather or NOAA API
3. Create weather market templates
4. Add location and metric selectors

### Phase 3: Social + Entertainment
**Social Media:**
1. Add Switchboard custom feeds
2. Integrate Twitter API v2 for follower/like data
3. YouTube API for view counts
4. Instagram/TikTok metrics

**Entertainment:**
1. Box Office Mojo API integration
2. Netflix/Streaming rankings API
3. Award show results (Oscars, Grammys)
4. Gaming metrics (Twitch, Steam charts)

### Phase 4: Advanced Features
1. **Multi-Oracle Consensus**: Use 2+ oracles for verification
2. **Fallback Mechanisms**: Manual resolution if oracle fails
3. **Dispute Resolution**: Community voting on contested outcomes
4. **Custom Oracle Builder**: Let users create custom data feeds

## Oracle Provider Comparison

| Provider | Best For | Cost | Reliability | Solana Support |
|----------|----------|------|-------------|----------------|
| **Pyth** | High-frequency prices | Low | Excellent | ✅ Native |
| **Chainlink** | Sports, Weather | Medium | Excellent | ✅ Via adapter |
| **Switchboard** | Custom data | Low | Good | ✅ Native |
| **API3** | First-party data | Medium | Good | ⚠️ Limited |
| **Band Protocol** | Cross-chain data | Medium | Good | ⚠️ Via bridge |

## Security Considerations

### Data Validation
- ✅ Verify oracle signatures
- ✅ Check data freshness (< 60 seconds)
- ✅ Validate data source authenticity
- ✅ Require minimum confidence score

### Attack Vectors
1. **Oracle Manipulation**: Use multiple sources for consensus
2. **Stale Data**: Reject data older than 60 seconds
3. **Invalid Feed**: Verify feed addresses on-chain
4. **Front-running**: Use commit-reveal schemes for bets

### Best Practices
- Always validate oracle data on-chain
- Use time-locks for resolution
- Implement emergency pause mechanisms
- Allow dispute periods for high-value markets

## Testing Strategy

### 1. Price Oracle Testing (Complete)
```bash
# Create BTC price market
# Bet on YES/NO
# Wait for end_time
# Resolve with Pyth oracle
# Verify outcome matches Pyth price
```

### 2. Sports Oracle Testing
```bash
# Create NBA game winner market
# Mock game scores from Chainlink feed
# Resolve market with scores
# Verify correct team wins
```

### 3. Weather Oracle Testing
```bash
# Create temperature market
# Mock weather data from Chainlink
# Resolve with actual temperature
# Verify threshold logic
```

### 4. Social Oracle Testing
```bash
# Create Twitter follower market
# Mock follower count from API
# Resolve with actual count
# Verify threshold comparison
```

## Next Steps

### Immediate (Week 1)
1. ✅ Extend smart contract for multi-oracle support
2. ✅ Deploy updated program to devnet
3. ⏳ Update frontend create form for oracle types
4. ⏳ Add oracle badges and info displays

### Short-term (Week 2-3)
1. Integrate Chainlink Sports adapter
2. Create sports market templates
3. Add game ID lookup and selection
4. Implement score resolution UI

### Medium-term (Month 1-2)
1. Add Chainlink Weather integration
2. Create weather market templates
3. Integrate social media oracles
4. Add box office tracking

### Long-term (Month 3+)
1. Multi-oracle consensus mechanism
2. Custom oracle builder UI
3. Dispute resolution system
4. Advanced analytics and tracking

## Resources

### Oracle Documentation
- **Pyth**: https://docs.pyth.network/
- **Chainlink**: https://docs.chain.link/
- **Switchboard**: https://docs.switchboard.xyz/
- **TheRundown**: https://therundown.io/docs

### API Integrations
- **Twitter API**: https://developer.twitter.com/
- **Box Office Mojo**: https://www.boxofficemojo.com/api
- **AccuWeather**: https://developer.accuweather.com/
- **YouTube API**: https://developers.google.com/youtube

---

**Status**: Multi-oracle smart contract deployed ✅
**Program ID**: ocKzKFLEt9dWXtPmD1xQSvGgA7ugaFFkGv4oXnWNa2N
**Network**: Solana Devnet
**Next**: Frontend UI for all oracle types
