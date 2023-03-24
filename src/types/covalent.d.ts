interface CovalentTransaction {
  block_height: number;
  tx_hash: string;
  tx_offset: number;
  successful: boolean;
  from_address: string;
  to_address: string;
  value: string;
  gas_offered: number;
  gas_spent: number;
  gas_price: string;
  nonce: number;
  input_data: string;
  protocol: string | null;
  ns: string | null;
  token_transfer: string | null;
}
