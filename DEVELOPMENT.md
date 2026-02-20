# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Docker (optional but recommended)

### Quick Setup

1. **Clone and install dependencies:**
```bash
git clone https://github.com/shitoshi1488/x-kol-automation.git
cd x-kol-automation
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your actual API keys
```

3. **Database setup:**
```bash
createdb x_kol
psql x_kol -c "CREATE USER x_kol_user WITH PASSWORD 'your_secure_password';"
psql x_kol -c "GRANT ALL PRIVILEGES ON DATABASE x_kol TO x_kol_user;"
npm run db:init
```

4. **Start development:**
```bash
npm run dev
```

## Development Workflow

### Component Architecture

```
┌─────────────────┐
│   Twitter API   │ ──┐
└─────────────────┘   │
                       ▼
┌─────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│   DEX Screener  │ │ Twitter Stream  │ │  Reply Engine   │
└─────────────────┘ └──────────────────┘ └─────────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             ▼
                   ┌──────────────────┐
                   │   AI Generator   │
                   └──────────────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │  Engagement      │
                   │  Actions          │
                   └──────────────────┘
```

### Adding New Features

#### 1. New Persona Type
Edit `src/personas/manager.ts`:
```typescript
this.personas.set('NewPersona', {
  name: 'NewPersona',
  bio: 'Your bio here',
  expertise: ['skill1', 'skill2'],
  tone: 'technical' | 'casual' | 'meme',
  engagement_style: 'helpful' | 'controversial' | 'neutral'
});
```

#### 2. New Twitter Trigger
Add to `src/twitter/stream.ts` in `startTracking()`:
- Add new influencers to the array
- Add new keywords/hashtags

#### 3. Custom Engagement Logic
Modify `src/automation/reply-engine.ts`:
- Update `shouldEngage()` scoring algorithm
- Adjust thresholds in `calculateEngagementScore()`
- Add new engagement types

#### 4. Trading Strategy
Extend `src/trading/executor.ts`:
- Add new signal types
- Modify `calculatePositionSize()`
- Add stop-loss/take-profit logic

### Testing

#### Unit Tests (coming soon)
```bash
npm test
```

#### Manual Testing
```bash
# 1. Start the system
npm start

# 2. Check health
curl http://localhost:3000/health

# 3. Test reply generation (without posting)
curl -X POST http://localhost:3000/test/generate \
  -H "Content-Type: application/json" \
  -d '{"tweetId":"123","text":"Bitcoin is going to the moon!"}'

# 4. View logs
curl http://localhost:3000/logs
```

### Debugging

#### Enable debug logging:
```bash
DEBUG=* npm run dev
```

#### Check system status:
```bash
curl http://localhost:3000/status
```

#### Monitor engagement:
```bash
curl http://localhost:3000/engagement
```

#### Check rate limits:
```bash
curl http://localhost:3000/rate-limit
```

### Database Migrations

If you need to modify the schema:

1. Edit `src/db/schema.ts`
2. Run migration manually:
```bash
npx ts-node src/db/schema.ts
```
3. Document the change in `MIGRATIONS.md`

### Performance Optimization

#### Reduce API calls:
- Adjust intervals in `src/app.ts`
- Add caching layer in Redis
- Implement batch processing

#### Memory management:
- Watch `processedTweets` set growth
- Implement database cleanup jobs
- Set TTL for cached data

### Production Checklist

- [ ] All environment variables set
- [ ] Database backup configured
- [ ] Log aggregation set up
- [ ] Monitoring alerts configured
- [ ] Rate limits tuned
- [ ] Error handling tested
- [ ] Security audit done
- [ ] Load testing completed
- [ ] Disaster recovery plan in place

### Common Issues During Development

1. **Twitter API rate limits**
   - Solution: Adjust `rateLimiter` config in `src/app.ts`
   - Check limits: `GET https://api.twitter.com/1.1/application/rate_limit_status.json`

2. **Database connection errors**
   - Verify PostgreSQL is running
   - Check connection string format
   - Ensure user has proper permissions

3. **Memory leaks**
   - Monitor `processedTweets` set size
   - Add periodic cleanup if needed
   - Use Node.js heap snapshots

4. **Docker development**
```bash
# Rebuild after changes
docker-compose build app
docker-compose up -d
docker-compose logs -f app
```

### Contributing

1. Fork and create feature branch
2. Make changes with clear commits
3. Test thoroughly
4. Update documentation
5. Submit PR with description

### Code Style

- Use TypeScript strict mode
- Prefer async/await over callbacks
- Add JSDoc comments for public methods
- Keep functions under 50 lines when possible
- Follow existing naming conventions

### Security Notes

- Never commit `.env` files
- Rotate API keys regularly
- Use minimal permissions for database user
- Encrypt sensitive data at rest
- Implement request validation
- Add authentication for admin endpoints
- Regular security audits