export interface BrokerTradeResponse {
  id: string;
  user_id: string;
  ticker: string;
  trade_type: "buy" | "sell";
  quantity: number;
  price: number;
  total_amount: number;
  timestamp: string;
}