# Arbitrage Trading Bot

## Description
This bot is designed to automatically detect and exploit arbitrage opportunities across multiple cryptocurrency exchanges.  
It connects to exchanges via WebSocket to receive real-time order book data and places orders through APIs to capture profit.

## Supported Exchanges
- Binance
- Bybit
- OKX
- MEXC
- BingX

## Key Features
- Connects to exchanges via WebSocket for live market data
- Analyzes order books to find best buy and sell prices
- Calculates arbitrage profitability automatically
- Instantly places orders on respective exchanges
- Uses builder pattern for configuration management

## Tech Stack
- Node.js (TypeScript)
- WebSocket for data streaming
- REST API for trading (Binance)
- Cryptography for request signing (HMAC SHA256)
- dotenv for environment variable management

## Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/arbitrage-bot.git
cd arbitrage-bot

2. Install dependencies:
npm install

3. Create a .env file based on .env.example and fill in your API keys and other parameters:

4. Run the bot:
npm ts-node index.ts