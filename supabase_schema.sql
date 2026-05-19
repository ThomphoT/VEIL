-- VEIL Supabase Schema
-- AI-Native Financial Governance Infrastructure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(64) UNIQUE NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    merchant VARCHAR(255) NOT NULL,
    merchant_category VARCHAR(64),
    customer_id VARCHAR(64) NOT NULL,
    device_id VARCHAR(64),
    ip_address VARCHAR(45),
    geolocation VARCHAR(16),
    decision VARCHAR(16) NOT NULL,
    risk_score DECIMAL(5, 2) NOT NULL,
    confidence DECIMAL(5, 4) NOT NULL,
    agent_results JSONB NOT NULL DEFAULT '[]',
    explanation TEXT,
    raw_transaction JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_decision ON transactions(decision);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_risk_score ON transactions(risk_score DESC);

-- Agents audit log
CREATE TABLE IF NOT EXISTS agent_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(64) NOT NULL,
    agent_name VARCHAR(64) NOT NULL,
    score DECIMAL(5, 2),
    confidence DECIMAL(5, 4),
    finding TEXT,
    recommendation TEXT,
    latency_ms DECIMAL(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_audit_transaction ON agent_audit_log(transaction_id);

-- Voice queries log
CREATE TABLE IF NOT EXISTS voice_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(64),
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_queries ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for backend API)
CREATE POLICY service_full_access ON transactions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY service_full_access_audit ON agent_audit_log
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY service_full_access_voice ON voice_queries
    FOR ALL USING (true) WITH CHECK (true);
