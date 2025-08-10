-- ICOPAX Backend Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) UNIQUE NOT NULL,
    referrer VARCHAR(42),
    txns INTEGER DEFAULT 0,
    owned_tokens DECIMAL(18,6) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS txns (
    id SERIAL PRIMARY KEY,
    stage INTEGER NOT NULL,
    amount DECIMAL(18,6) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    chain_id INTEGER NOT NULL,
    payment_asset VARCHAR(10) NOT NULL,
    payment_amount DECIMAL(18,6) NOT NULL,
    payment_price DECIMAL(18,6) NOT NULL,
    is_vested BOOLEAN DEFAULT false,
    user_id INTEGER REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_address ON users(address);
CREATE INDEX idx_users_referrer ON users(referrer);
CREATE INDEX idx_txns_user_id ON txns(user_id);
CREATE INDEX idx_txns_tx_hash ON txns(tx_hash);

-- Update trigger for updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updatedAt = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_txns_updated_at BEFORE UPDATE ON txns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();