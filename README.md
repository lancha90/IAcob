# 🤖 IAcob - Autonomous Trading Agent

An autonomous AI-powered trading agent built with OpenAI's Agents framework and clean architecture principles. The agent trades both stocks and cryptocurrencies with the goal of growing an initial $1,000 investment through strategic decision-making.

<!-- auto STOCK start -->
  
  ## 💰 Portfolio STOCK value: $1,016.65**
  
  ### 📊 Holdings
  
  | Asset | Shares | Value |
  |-------|--------|-------|
  | ENPH | 3 | $95.93 |
| MSFT | 1 | $524.05 |
| ETH | 0.033 | $1.24 |
| SHOP | 1 | $149.15 |
| WBD | 10 | $118.25 |
| ACMR | 4 | $95.78 |
  
  <!-- auto STOCK end -->

  <!-- auto CRYPTO start -->
  
  ## 💰 Portfolio CRYPTO value: $1,132.29**
  
  ### 📊 Holdings
  
  | Asset | Shares | Value |
  |-------|--------|-------|
  | SOL | 0.8118999999999996 | $143.88 |
| BTC | 0.0017569999999999997 | $205.26 |
| ETH | 0.1114 | $435.58 |
| XRP | 56.8 | $189.14 |
| SUI | 5.259999999999998 | $20.09 |
| ZORA | 1200 | $100.28 |
  
  <!-- auto CRYPTO end -->

- [🧠 Logs](./agent.log)
- [🧑‍💻 System prompt](./system-prompt.md)
- [📁 Source code](./agent.ts)

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
domain/          # Business entities and validation schemas
├── dto/         # Data Transfer Objects with Zod validation
├── enum/        # Market type enums (STOCK/CRYPTO)

usecase/         # Business logic layer
├── tools/       # OpenAI Agent tools (buy, sell, portfolio, etc.)
├── *.usecase.ts # Core business operations

infra/           # Infrastructure layer
├── database/    # Supabase integration for trade persistence

resource/        # External resources
├── prompt/      # AI agent system prompts
├── output/      # Generated logs and thread histories
```

## 🚀 Key Features

- **Dual Market Support**: Trades both stocks and cryptocurrencies
- **Autonomous Decision Making**: Uses mandatory "think" tool for transparency
- **Dual Persistence Strategy**: 
  - Local JSON files for current portfolio state
  - Supabase database for complete trade history
- **Web Search Integration**: Market research and analysis capabilities
- **Clean Architecture**: Modular, testable, and maintainable codebase
- **Automated Documentation**: README auto-updates with portfolio values
- **WhatsApp Notifications**: Status updates via Twilio
- **Comprehensive Logging**: Timestamped execution traces

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/AnandChowdhary/priced-in.git
cd IAcob
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Required - OpenAI API for the trading agent
export OPENAI_API_KEY="your-openai-api-key"

# Required - Market type (STOCK or CRYPTO)
export IACOB_MARKET_TYPE="STOCK"  # or "CRYPTO"

# Required - Supabase for trade history persistence
export SUPABASE_URL="your-supabase-url"
export SUPABASE_KEY="your-supabase-anon-key"

# Required - Twilio for WhatsApp notifications
export TWILIO_ACCOUNT_SID="your-twilio-account-sid"
export TWILIO_AUTH_TOKEN="your-twilio-auth-token"
export TWILIO_CONTENT_SID="your-twilio-content-template-sid"
export TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"  # Twilio Sandbox number
export WHATSAPP_RECIPIENT_NUMBER="whatsapp:+1234567890"  # Your WhatsApp number

# Optional - Alpha Vantage API for stock prices (fallback)
export ALPHAVANTAGE_API_KEY="your-alphavantage-api-key"
```

## 🏃‍♂️ Running the agent

The agent's portfolio is stored in separate JSON files:

- `portfolio_stock.json` - Stock trading portfolio
- `portfolio_crypto.json` - Cryptocurrency trading portfolio

```json
{
  "cash": 1000,
  "holdings": {
    "AAPL": 5,
    "MSFT": 2
  },
  "history": []
}
```

- **cash**: Available cash balance for trading
- **holdings**: Current positions (ticker: number of shares/coins)
- **history**: Complete trade history (stored in Supabase, cleared locally)

### Local execution

Run the trading agent manually:

```bash
npm start
```

This will execute one trading session where the agent will:

1. Load conversation history from thread storage
2. Use the "think" tool for transparent decision-making
3. Check current portfolio status and net worth
4. Perform market research via web search
5. Execute buy/sell decisions based on analysis
6. Update portfolio and save trade history to Supabase
7. Send WhatsApp notification and update README

## 🔧 Agent Tools

The agent has access to these tools:

- **think**: Mandatory reasoning tool for transparency
- **get_portfolio**: Check current portfolio status and holdings
- **get_net_worth**: Quick portfolio value and return percentage
- **get_stock_price** / **get_crypto_price**: Real-time price queries
- **buy** / **sell**: Execute trades with automatic validation
- **web_search**: Market research and news analysis

## 🛡️ Trading Strategy

The agent follows a structured decision process:

1. **Think**: Mandatory reasoning before any action
2. **Portfolio Review**: Check current positions and cash
3. **Market Analysis**: Research trends and opportunities
4. **Risk Assessment**: Evaluate potential downside
5. **Execution**: Make calculated trading decisions
6. **Documentation**: Update logs and portfolio tracking

### Automated execution via GitHub Actions

The agent can be configured to run automatically via GitHub Actions. To enable this:

1. Fork this repository
2. Go to Settings → Secrets and variables → Actions
3. Add repository secrets for all required environment variables
4. Configure the workflow schedule as needed

You can also trigger manual runs from the Actions tab in your GitHub repository.

## ⚠️ Disclaimer

This is an experimental AI trading agent for educational purposes. Real trading involves significant risk. Never invest money you cannot afford to lose.

## 📄 License

[MIT](./LICENSE) © [Anand Chowdhary](https://anandchowdhary.com)
