mkdir -p /docker-entrypoint-initdb.d

# Create additional extensions if needed
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
    
    -- Set timezone to UTC
    SET timezone = 'UTC';
    
    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_replies_created_at ON replies(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_onchain_created_at ON onchain_data(created_at DESC);
EOSQL