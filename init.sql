-- initdb/init.sql
CREATE TABLE IF NOT EXISTS block_entity (
  hash VARCHAR(66) PRIMARY KEY,
  number INT,
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

CREATE TABLE IF NOT EXISTS transaction_entity (
  id SERIAL PRIMARY KEY,
  block_number INT,
  hash VARCHAR(66),
  type INT,
  "to" VARCHAR(42),
  "from" VARCHAR(42),
  nonce INT,
  gas_limit NUMERIC,
  gas_price NUMERIC,
  data TEXT,
  value NUMERIC,
  chain_id NUMERIC,
  block_hash VARCHAR(66),
  FOREIGN KEY (block_hash) REFERENCES block_entity (hash)
);
