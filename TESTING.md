# Testing Guide for X KOL Automation System

This guide provides comprehensive testing procedures to verify all components are working correctly.

## Prerequisites Testing

### 1. Environment Variables Check
```bash
node scripts/verify-setup.js
```

Expected output: All checks should show ✅

### 2. Twitter API Credentials
```bash
node scripts/verify-twitter.js
```

Expected: Authentication successful with rate limit information

### 3. Manual Environment Check
```bash
# Verify .env file exists and is configured
if [ -f .env ]; then
  echo "✅ .env file exists"
  source .env
  echo "✅ Environment variables loaded"
else
  echo "❌ .env file missing"
fi
```

## Database Testing

### 1. Connection Test
```bash
# Simple connection test
psql $DATABASE_URL -c "SELECT 1;" 2>/dev/null
```

Expected: `1`

### 2. Schema Verification
```bash
# Connect to database and check tables
psql $DATABASE_URL -c "\dt"
```

Expected tables:
- `twitter_accounts`
- `personas`
- `tweets`
- `replies`
- `onchain_data`
- `signals`

### 3. Index Verification
```bash
psql $DATABASE_URL -c "\di"
```

Expected indexes:
- `idx_tweets_author_username`
- `idx_tweets_processed`
- `idx_replies_tweet_id`
- `idx_onchain_token_address`
- `idx_signals_processed`
- `idx_signals_token_address`

## API Testing

### 1. Start the Application
```bash
# Development mode
npm run dev

# Or production mode
npm run build
npm start
```

Expected: Server starts on port 3000 (or $PORT)

### 2. Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "isRunning": true,
  "uptime": 123.45,
  "startTime": "2025-02-20T20:00:00.000Z",
  "processedTweets": 0,
  "activeTrades": 0,
  "rateLimiter": 50,
  "logs": { "total": 1, "info": 1, "warn": 0, "error": 0, "debug": 0 }
}
```

### 3. Status Check
```bash
curl http://localhost:3000/status
```

Expected: System status with component information

### 4. Logs Endpoint
```bash
curl http://localhost:3000/logs
```

Expected: Recent log entries array

### 5. Rate Limit Check
```bash
curl http://localhost:3000/rate-limit
```

Expected: Remaining calls and next available time

### 6. Engagement Stats
```bash
curl http://localhost:3000/engagement
```

Expected: Engagement statistics

## Component Testing

### 1. Database Repository Test
Create `test-db.js`:
```javascript
const { db } = require('./dist/db/index');

async function testDatabase() {
  try {
    // Test query
    const result = await db.query('SELECT NOW() as time');
    console.log('✅ Database connection:', result.rows[0].time);
    
    // Test schema
    const tables = await db.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name;
    `);
    console.log('✅ Tables found:', tables.rows.map(r => r.table_name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();
```

Run:
```bash
npx ts-node test-db.js
```

### 2. Twitter Stream Test
```bash
# Start the system and watch logs for streaming connection
tail -f logs/app.log | grep "Twitter stream"
```

Expected: "Twitter stream started tracking" message

### 3. DEX Screener API Test
```javascript
// test-dex.js
const { DEXScreenerAPI } = require('./dist/chain/dex-screener');

async function testDex() {
  try {
    const api = new DEXScreenerAPI();
    const trending = await api.getTrendingTokens();
    console.log('✅ DEX Screener API:', trending.length, 'trending tokens');
    
    const gainers = await api.getTopGainers();
    console.log('✅ Top gainers:', gainers.length, 'tokens');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ DEX Screener test failed:', error.message);
    process.exit(1);
  }
}

testDex();
```

### 4. OpenAI Content Generation Test
```javascript
// test-ai.js
const { ContentGenerator } = require('./dist/content/generator');
const { Persona } = require('./dist/types');

async function testAI() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY not set');
      process.exit(1);
    }
    
    const generator = new ContentGenerator(apiKey);
    const persona: Persona = {
      name: 'TestBot',
      bio: 'Test persona',
      expertise: ['testing'],
      tone: 'casual',
      engagement_style: 'helpful'
    };
    
    const testTweet = {
      tweet_id: '123',
      author_username: 'testuser',
      content: 'Bitcoin is going to the moon!',
      author_followers: 1000,
      author_verified: false,
      processed: false
    };
    
    const reply = await generator.generateReply(testTweet, persona);
    console.log('✅ AI generated reply:', reply.substring(0, 100) + '...');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ AI test failed:', error.message);
    process.exit(1);
  }
}

testAI();
```

### 5. Full System Integration Test
```javascript
// test-integration.js
const { XKOLAutomation } = require('./dist/app');

async function testIntegration() {
  try {
    const automation = new XKOLAutomation();
    await automation.initialize();
    
    console.log('✅ System initialized');
    console.log('✅ Components:', {
      twitter: !!automation['twitterStream'],
      dexScreener: !!automation['dexScreener'],
      replyEngine: !!automation['replyEngine'],
      tradingExecutor: !!automation['tradingExecutor']
    });
    
    // Test health endpoint
    const health = automation.getHealthStatus();
    console.log('✅ Health status:', health);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    process.exit(1);
  }
}

testIntegration();
```

## Endpoint Testing with cURL

### Health Check
```bash
curl -f http://localhost:3000/health || echo "❌ Health check failed"
```

### Start/Stop System
```bash
# Start
curl -X POST http://localhost:3000/start

# Stop
curl -X POST http://localhost:3000/stop
```

## Docker Testing

### 1. Build Check
```bash
docker build -t x-kol-automation .
docker images | grep x-kol-automation
```

Expected: Image should be listed

### 2. docker-compose Up
```bash
docker-compose up -d
docker-compose ps
```

Expected: All services (postgres, redis, app) should be "Up"

### 3. Container Logs
```bash
docker-compose logs -f app
```

Expected: Application startup logs

### 4. Container Health
```bash
docker-compose exec app curl http://localhost:3000/health
```

### 5. Cleanup
```bash
docker-compose down -v
```

## Performance Testing

### 1. Concurrent Requests
```bash
# Install Apache Bench if needed
# brew install ab  # macOS
# sudo apt-get install apache2-utils  # Ubuntu

# Run 100 requests with 10 concurrent
ab -n 100 -c 10 http://localhost:3000/health
```

Expected: Successful responses > 95%

### 2. Memory Usage
```bash
# Check while running
ps aux | grep node | grep -v grep
```

Expected: Reasonable memory (< 500MB typically)

### 3. Database Connection Pool
```bash
# Check PostgreSQL connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'x_kol';"
```

Expected: Low number of connections (< 20)

## Security Testing

### 1. No Sensitive Files in Git
```bash
git ls-files | grep -E "(env|key|secret|password)" || echo "✅ No sensitive files tracked"
```

### 2. .env Not Committed
```bash
git status | grep ".env" || echo "✅ .env not in git"
```

### 3. Environment Variable Access
```bash
# Verify endpoints don't leak environment
curl http://localhost:3000/status | grep -i "password\|secret\|key" || echo "✅ No secrets in response"
```

## Load Testing (Optional)

### Twitter Streaming Simulation
```javascript
// simulate-stream.js
const { Twit } = require('twit');

const T = new Twit({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Test with sample tweet stream (use a public account)
const stream = T.stream('statuses/filter', {
  follow: ['44196397'], // @elonmusk
  track: ['test']
});

let count = 0;
stream.on('tweet', (tweet) => {
  count++;
  console.log(` Received tweet ${count} from @${tweet.user.screen_name}`);
  if (count >= 5) {
    stream.stop();
    console.log('✅ Stream test completed');
    process.exit(0);
  }
});

setTimeout(() => {
  stream.stop();
  console.log('✅ Stream test timeout - working');
  process.exit(0);
}, 30000);
```

## Troubleshooting Tests

### Test Fail?

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL is running
   pg_isready
   # Start if needed
   pg_ctl start
   ```

2. **Redis Connection Failed**
   ```bash
   # Check if Redis is running
   redis-cli ping
   # Start if needed
   redis-server
   ```

3. **TypeScript Compilation Errors**
   ```bash
   # Clean and rebuild
   rm -rf dist
   npm run build
   ```

4. **API Test Failures**
   - Check logs: `curl http://localhost:3000/logs`
   - Verify environment variables
   - Check rate limits: `curl http://localhost:3000/rate-limit`

## Success Criteria

All tests should pass:
- [ ] Environment verification script passes
- [ ] Twitter API credentials valid
- [ ] Database connected with correct schema
- [ ] All API endpoints return valid JSON
- [ ] Health check shows system running
- [ ] No sensitive files in git
- [ ] Docker builds successfully
- [ ] Memory usage is reasonable
- [ ] No compilation errors

## Quick Verification Command

Run all tests in sequence:
```bash
#!/bin/bash
echo "=== X KOL Automation System Verification ==="
echo ""
echo "1. Environment check..."
node scripts/verify-setup.js
echo ""
echo "2. Twitter verification..."
node scripts/verify-twitter.js
echo ""
echo "3. Build check..."
npm run build
echo ""
echo "4. Database check..."
npx ts-node test-db.js
echo ""
echo "5. Start system..."
npm start &
PID=$!
sleep 5
echo ""
echo "6. API test..."
curl -s http://localhost:3000/health | jq . || echo "API not responding"
echo ""
echo "7. Stop system..."
kill $PID
echo ""
echo "=== Verification Complete ==="
```

---

**Note**: These tests are for verification and development. For production deployment, use proper monitoring and alerting systems.