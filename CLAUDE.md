# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an autonomous AI-powered stock trading agent built with OpenAI's Agents framework. The agent executes trades automatically, manages a portfolio, and makes investment decisions to grow an initial $1,000 investment.

## Commands

### Development
- `npm start` - Run the trading agent locally using `tsx agent-clean.ts`
- `npm install` - Install dependencies
- `npm test` - Run tests (currently not implemented)

### TypeScript
- The project uses TypeScript with ES2022 modules
- No explicit build step needed - uses `tsx` for direct execution
- Type checking: `tsc --noEmit` (though not defined in scripts)

## Architecture

### Clean Architecture Structure
The codebase follows clean architecture principles with clear separation of concerns:

```
domain/          # Business entities and DTOs
├── dto/         # Data Transfer Objects with Zod validation schemas
usecase/         # Business logic layer
├── tools/       # OpenAI Agent tools (buy, sell, portfolio, etc.)
infra/           # Infrastructure layer
├── database/    # Supabase integration for trade persistence
resource/        # External resources
├── prompt/      # AI agent system prompts
├── output/      # Generated logs and thread histories
```

### Core Components

**Agent Entry Point (`agent-clean.ts`)**
- Main execution file that initializes the OpenAI Agent
- Configures tools and logging
- Loads conversation thread and executes trading session
- Saves results and updates documentation

**UseCase Layer**
- `portafolio.usecase.ts` - Portfolio management and calculations
- `stock.usercase.ts` - Stock price fetching with web search integration
- `websearch.usecase.ts` - Market research capabilities
- `thread.usecase.ts` - Conversation persistence
- `readme.usecase.ts` - Auto-documentation updates

**Tools (OpenAI Agent Interface)**
- `trading.tools.ts` - Buy/sell operations with Supabase logging
- `portfolio.tools.ts` - Portfolio status and net worth calculations
- `stock.tools.ts` - Stock price queries
- `websearch.tools.ts` - Market research tool
- `think.tools.ts` - Reasoning transparency tool

**Domain Objects**
- `portfolio.dto.ts` - Portfolio schema with cash, holdings, and history
- `trade.dto.ts` - Trade transaction schema

### Key Features

**Dual Persistence Strategy**
- Local `portfolio.json` for current state (cash + holdings)
- Supabase database for complete trade history
- Trade history cleared from local file but preserved in database

**Autonomous Decision Making**
- Mandatory "think" tool usage before any action for transparency
- Web search integration for market analysis
- Risk management and portfolio diversification logic

**Automated Documentation**
- README.md auto-updates with current portfolio value and recent trades
- Comprehensive logging with timestamped trace files

## Environment Variables

Required:
- `OPENAI_API_KEY` - OpenAI API key for agent operations
- Supabase credentials (for trade persistence)

## File Structure Notes

- `portfolio.json` - Current portfolio state (excluded from git with local changes)
- `resource/output/traces/` - Execution logs with timestamps
- `resource/output/thread/thread.json` - Conversation history for context
- `resource/prompt/system-prompt.md` - Agent instructions and trading strategy

## Trading Agent Behavior

The agent follows a structured decision process:
1. Uses `think` tool for transparent reasoning
2. Checks portfolio status
3. Performs market research via web search
4. Identifies trading opportunities
5. Executes buy/sell decisions
6. Updates documentation automatically

The agent responds in Spanish as configured in the system prompt.