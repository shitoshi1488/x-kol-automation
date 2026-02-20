# X KOL Automation System

🚀 **AI-powered Twitter engagement and trading automation for crypto influencers**

An enterprise-grade automation system that monitors influential Twitter accounts, generates context-aware replies using GPT-4, and executes trading signals based on social sentiment and on-chain data.

## Features

- **Real-time Twitter Streaming**: Monitor top crypto influencers and trending hashtags
- **AI-Powered Content Generation**: GPT-4 powered replies with persona-based customization
- **Multi-Persona System**: 5 distinct bot personas with different tones and engagement styles
- **Smart Engagement**: Automatically decides when to reply, create threads, or skip engagement
- **On-Chain Integration**: DEX Screener API for real-time token data and trading signals
- **Automated Trading**: Solana blockchain integration for token swaps
- **Database Storage**: PostgreSQL for tweet history, responses, and trading signals
- **Job Queue**: Redis/Bull for async task processing
- **REST API**: HTTP endpoints for monitoring and control
- **Docker Support**: Containerized deployment

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Twitter API   │───▶│  Twitter Stream  │───▶│   Reply Engine  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌──────────────────┐             ▼
│  DEX Screener   │───▶│  Signal Generator │───▶───▶Content Generator
└─────────────────┘    └──────────────────┘             │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Solana RPC     │◀───│ Trading Executor │◀───│   Signal DB     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

### Installation

1. **Clone and setup**
```bash
cd x-kol-automation
npm install
cp .env.example .env
```

2. **Configure environment**
Edit `.env` with your API keys:
- Twitter Developer API credentials
- OpenAI API key
- PostgreSQL connection string
- Redis connection string
- Solana RPC URL and optional wallet private key

3. **Database setup**
```bash
createdb x_kol
psql x_kol -c "CREATE USER x_kol_user WITH PASSWORD 'your_password';"
psql x_kol -c "GRANT ALL PRIVILEGES ON DATABASE x_kol TO x_kol_user;"
npm run db:init
```

4. **Build and run**
```bash
npm run build
npm start
```

Or for development with hot reload:
```bash
npm run dev
```

### Docker Setup

```bash
docker-compose up -d
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TWITTER_API_KEY` | ✅ | Twitter API Key from developer portal |
| `TWITTER_API_SECRET` | ✅ | Twitter API Secret |
| `TWITTER_ACCESS_TOKEN` | ✅ | User access token |
| `TWITTER_ACCESS_TOKEN_SECRET` | ✅ | User access token secret |
| `OPENAI_API_KEY` | ✅ | OpenAI GPT-4 API key |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `SOLANA_RPC_URL` | ✅ | Solana RPC endpoint |
| `PRIVATE_KEY` | ⚠️ | Encrypted private key for trading (optional) |
| `PORT` | ⚙️ | Server port (default: 3000) |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | System health check |
| `/status` | GET | Detailed system status |
| `/start` | POST | Start the automation system |
| `/stop` | POST | Stop the automation system |

## Personas

The system includes 5 distinct personas:

1. **CryptoSavvy** - Technical, DeFi-focused, helpful
2. **MemeMaster** - Casual, meme-heavy, controversial
3. **MarketWizard** - Technical analysis, chart patterns, helpful
4. **NewbieNinja** - Educational, community-focused, helpful
5. **AlphaCaller** - Trading signals, early opportunities, controversial

## Configuration

### Twitter Tracking
Edit `src/twitter/stream.ts` to customize:
- Influencer usernames to follow
- Keywords/hashtags to track
- Stream sampling rate

### Persona Settings
Customize in `src/personas/manager.ts`:
- Add/remove personas
- Adjust persona selection logic
- Modify tone and engagement styles

### Trading Parameters
Configure in `src/trading/executor.ts`:
- Position sizing formula
- Slippage tolerance
- Risk management rules

## Development

```bash
# Build TypeScript
npm run build

# Run with hot reload
npm run dev

# Type check only
npm run lint

# Initialize database schema
npm run db:init
```

## Project Structure

```
src/
├── config/          # Configuration management
├── content/         # AI content generation
│   └── generator.ts # GPT-4 integration
├── automation/      # Engagement automation
│   └── reply-engine.ts
├── chain/           # Blockchain integration
│   └── dex-screener.ts
├── trading/         # Trading execution
│   └── executor.ts
├── twitter/         # Twitter API integration
│   └── stream.ts
├── personas/        # Persona management
│   └── manager.ts
├── db/              # Database layer
│   ├── index.ts
│   ├── schema.ts
│   └── repositories.ts
├── types/           # TypeScript definitions
│   └── index.ts
├── app.ts           # Main application class
└── index.ts         # Entry point
```

## Safety & Best Practices

⚠️ **Important**: This system is designed for educational purposes. Use responsibly:

- Start with low engagement rates (1-2 tweets/hour)
- Use multiple Twitter accounts to distribute risk
- Never use with real funds until thoroughly tested
- Monitor for account suspension risks
- Keep API keys secure and never commit them
- Implement rate limiting and fail-safes
- Regular review of generated content

## Testing

```bash
# Unit tests (to be implemented)
npm test

# System check
curl http://localhost:3000/health
curl http://localhost:3000/status
```

## Deployment

### Production Checklist

- [ ] All environment variables configured
- [ ] Database backup strategy in place
- [ ] Monitoring and logging setup
- [ ] Rate limits configured
- [ ] Wallet funds within risk tolerance
- [ ] API key permissions verified
- [ ] Security headers enabled
- [ ] SSL/TLS configured

### Docker Deployment

```bash
docker build -t x-kol-automation .
docker run -d --name kol-bot -p 3000:3000 --env-file .env x-kol-automation
```

## Troubleshooting

### Common Issues

1. **Twitter stream disconnects**
   - Check API credentials
   - Verify elevated access for filtered stream
   - Review rate limits

2. **Database connection errors**
   - Verify PostgreSQL is running
   - Check connection string
   - Ensure user has proper permissions

3. **Trading failures**
   - Confirm wallet balance
   - Check Solana RPC status
   - Verify token metadata

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT

## Disclaimer

This software is for educational purposes only. Cryptocurrency trading involves significant risk. The authors are not responsible for any losses incurred through the use of this software. Always do your own research and consult with financial advisors before making investment decisions.