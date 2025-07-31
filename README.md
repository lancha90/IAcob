# 🤖 Priced In

An autonomous AI-powered stock trading agent that executes trades on GitHub Actions, built with OpenAI's Agents framework.

<!-- auto STOCK start -->
  
  ## 💰 Portfolio stock value: $1,000.00**
  
  ### 📊 Holdings
  
  | Asset | Shares | Value |
  |-------|--------|-------|
  | ENPH | 6 | $194.16 |
  
  <!-- auto STOCK end -->

  <!-- auto CRYPTO start -->
  
  ## 💰 Portfolio CRYPTO value: $996.31**
  
  ### 📊 Holdings
  
  | Asset | Shares | Value |
  |-------|--------|-------|
  | SOL | 2.3118999999999996 | $398.18 |
| BTC | 0.002583 | $299.39 |
| ETH | 0.0807 | $298.66 |
  
  <!-- auto CRYPTO end -->

- [🧠 Logs](./agent.log)
- [🧑‍💻 System prompt](./system-prompt.md)
- [📁 Source code](./agent.ts)

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/AnandChowdhary/priced-in.git
cd priced-in
```

2. Install dependencies:

```bash
npm install
```

3. Set up your OpenAI API key:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

## 🏃‍♂️ Running the agent

The agent's portfolio is stored in `portfolio.json`:

```json
{
  "cash": 1000,
  "holdings": {
  },
  "history": []
}
```

- **cash**: Available cash balance for trading
- **holdings**: Current stock positions (ticker: number of shares)
- **history**: Complete record of all trades

### Local execution

Run the trading agent manually:

```bash
npm start
```

This will execute one trading session where the agent will:

1. Check the current portfolio
2. Analyze market conditions
3. Make trading decisions
4. Update the portfolio

### Automated execution via GitHub Actions

The agent is configured to run automatically every hour via GitHub Actions. To enable this:

1. Fork this repository
2. Go to Settings → Secrets and variables → Actions
3. Add a new repository secret named `OPENAI_API_KEY` with your OpenAI API key
4. The agent will now run automatically every hour

You can also trigger a manual run from the Actions tab in your GitHub repository.

## ⚠️ Disclaimer

This is an experimental AI trading agent for educational purposes. Real trading involves significant risk. Never invest money you cannot afford to lose.

## 📄 License

[MIT](./LICENSE) © [Anand Chowdhary](https://anandchowdhary.com)
