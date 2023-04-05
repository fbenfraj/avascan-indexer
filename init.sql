-- initdb/init.sql
CREATE TABLE IF NOT EXISTS block_entity (
  id SERIAL,
  hash VARCHAR(66) UNIQUE,
  number INT,
  timestamp INT,
  parent_hash VARCHAR(66),
  nonce VARCHAR(18),
  difficulty NUMERIC,
  gas_limit NUMERIC,
  gas_used NUMERIC,
  miner VARCHAR(42),
  extra_data TEXT,
  base_fee_per_gas NUMERIC,
  PRIMARY KEY (id, hash)
);

CREATE INDEX block_entity_number ON block_entity (number);

CREATE TABLE IF NOT EXISTS transaction_entity (
  id SERIAL,
  block_number INT,
  index INT,
  hash VARCHAR(66) UNIQUE,
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
  FOREIGN KEY (block_hash) REFERENCES block_entity (hash),
  PRIMARY KEY (id, hash)
);

CREATE INDEX transaction_entity_block_number ON transaction_entity (block_number);

CREATE INDEX transaction_entity_to ON transaction_entity ("to");

CREATE INDEX transaction_entity_from ON transaction_entity ("from");

CREATE INDEX transaction_entity_block_hash ON transaction_entity (block_hash);