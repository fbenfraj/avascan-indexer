-- initdb/init.sql
CREATE TABLE IF NOT EXISTS block_entity (
  id SERIAL PRIMARY KEY,
  number INT,
  hash VARCHAR(66),
  timestamp INT,
  parent_hash VARCHAR(66),
  nonce VARCHAR(18),
  difficulty NUMERIC,
  gas_limit NUMERIC,
  gas_used NUMERIC,
  miner VARCHAR(42),
  extra_data TEXT,
  base_fee_per_gas NUMERIC
);

