# X KOL Automation - Operator Quick Reference

## 🚀 Start/Stop Commands

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start

# Docker
docker-compose up -d
docker-compose down

# System control via API
curl -X POST http://localhost:3000/start
curl -X POST http://localhost:3000/stop
```

## 📊 Essential Monitoring

```bash
# Health check (should return isRunning: true)
curl http://localhost:3000/health

# Detailed status
curl http://localhost:3000/status

# Recent logs (last 100 entries)
curl http://localhost:3000/logs

# Engagement statistics
curl http://localhost:3000/engagement

# Rate limit status
curl http://localhost:3000/rate-limit
```

## 📝 Configuration

**Location**: `.env` file in project root

**Required variables**:
```env
TWITTER_API_KEY=xxx
TWITTER_API_SECRET=xxx
TWITTER_ACCESS_TOKEN=xxx
TWITTER_ACCESS_TOKEN_SECRET=xxx
OPENAI_API_KEY=xxx
DATABASE_URL=postgresql://user:pass@localhost:5432/x_kol
REDIS_URL=redis://localhost:6379
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# PRIVATE_KEY=xxx (optional, for trading)
```

**⚠️ NEVER commit .env file!**

## 🔧 Common Tasks

### Reset database
```bash
npm run db:init
```

### View logs
```bash
# Application logs
tail -f logs/app.log

# Or via API
curl http://localhost:3000/logs

# Docker logs
docker-compose logs -f app
```

### Clear processed tweet cache
```bash
# Restart the app to clear in-memory cache
```

### Adjust engagement rate
Edit `src/automation/reply-engine.ts`:
- `shouldEngage()` return value (default threshold: 50)
- `shouldLike()` probability (default: 0.3)
- `shouldRetweet()` probability (default: 0.1)

### Change tracked accounts
Edit `src/app.ts`:
```typescript
const influencers = ['elonmusk', 'cz_binance', ...];
const keywords = ['#crypto', '#bitcoin', ...];
```

### Add new persona
Edit `src/personas/manager.ts` in `initializeDefaultPersonas()`:
```typescript
{
  name: 'NewPersona',
  bio: 'Description',
  expertise: ['skill1', 'skill2'],
  tone: 'technical', // or 'casual' | 'meme'
  engagement_style: 'helpful' // or 'controversial' | 'neutral'
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database connection refused" | Start PostgreSQL: `pg_ctl start` |
| "Redis connection refused" | Start Redis: `redis-server` |
| "Twitter authentication failed" | Verify API keys in .env, check permissions |
| "OpenAI API error" | Check API key, verify account balance |
| "Port already in use" | Kill process on port 3000 or change PORT in .env |
| "Rate limit exceeded" | Reduce engagement rate, add more bot accounts |
| "Cannot post replies" | Ensure Twitter app has Read & Write permissions |
| "Memory usage high" | Restart app, monitor processedTweets set size |

### Check system resources
```bash
# Memory
ps aux | grep node

# Database connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Redis info
redis-cli info memory
```

### restart everything
```bash
# Stop
npm run stop  # or Ctrl+C

# Clean
rm -rf dist logs/*.log

# Rebuild
npm run build

# Start fresh
npm start
```

## 📈 Key Metrics to Monitor

- **Processed tweets**: Number of tweets analyzed
- **Engagement rate**: Replies + likes + retweets per hour
- **API errors**: Count of failed API calls
- **Rate limit remaining**: Twitter API quota
- **Database connections**: Pool usage
- **Memory usage**: Node.js heap size

## 🔐 Security Checklist

- [ ] .env file NOT in git
- [ ] Strong database password
- [ ] Redis password set
- [ ] API keys have minimal required permissions
- [ ] Firewall allows only necessary ports
- [ ] SSL/TLS enabled for production
- [ ] Regular log rotation configured
- [ ] Automated backups for database

## 🆘 Emergency Procedures

### System behaving badly?
1. **Stop immediately**: `docker-compose down` or `Ctrl+C`
2. **Check logs**: `tail -f logs/app.log | tail -100`
3. **Verify recent changes**: `git log --oneline -10`
4. **Rollback if needed**: `git checkout <previous-commit>`
5. **Restart with reduced rate**: Adjust engagement settings

### Twitter account locked?
1. Stop all automation
2. Wait 24 hours
3. Reduce engagement rate by 50%
4. Add more bot accounts to distribute load
5. Review Twitter's automation rules

### Trading issue?
1. Check wallet balance
2. Verify Solana RPC connectivity
3. Review transaction history
4. Stop trading immediately if losses occur
5. Check for token approval issues

## 📞 Support Resources

- **Documentation**: See README.md, DEVELOPMENT.md, TESTING.md
- **GitHub Issues**: https://github.com/shitoshi1488/x-kol-automation/issues
- **Logs**: Always check logs first - they contain detailed error info
- **API Status**: Check Twitter/OpenAI status pages for outages

## 🔄 Updates

```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies if needed
rm -rf node_modules
npm install

# Rebuild
npm run build

# Restart
npm start
```

## 📋 Daily Checklist

- [ ] System is running (check /health)
- [ ] No errors in logs (check /logs)
- [ ] Rate limits are healthy (check /rate-limit)
- [ ] Database backups succeeded
- [ ] Engagement metrics look normal
- [ ] No Twitter API warnings
- [ ] Trading wallet balance checked (if enabled)

---

**Keep this file handy for quick reference!**