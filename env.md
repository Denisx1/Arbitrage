BINANCE_WEB_SOCKET=wss://fstream.binance.com/stream?streams=%SYMBOL%@depth10
BINANCE_TRADE_WEB_SOCKET=wss://ws-fapi.binance.com/ws-fapi/v1
BINANCE_SERVER_GET_TIME_URL=https://fapi.binance.com/fapi/v1/time

BINANCE_API_KEY=
BINANCE_API_SECRET=

BINANCE_PUBLIC_KEY=
BINANCE_PRIVATE_URL=

BYBIT_WEB_SOCKET=wss://stream.bybit.com/v5/public/linear
BYBIT_TRADE_WEB_SOCKET=wss://stream.bybit-tr.com/v5/trade
BYBIT_API_KEY=
BYBIT_API_SECRET=

OKX_WEB_SOCKET=wss://ws.okx.com:8443/ws/v5/public
OKX_TRADE_WEB_SOCKET=wss://ws.okx.com:8443/ws/v5/private
OKX_API_KEY=
OKX_API_SECRET=
OKX_PASSPHRASE=

MEXC_WEB_SOCKET=wss://contract.mexc.com/edge
MEXC_API_KEY=
MEXC_API_SECRET=

BINGX_WEB_SOCKET=wss://open-api-swap.bingx.com/swap-market
BINGX_API_KEY=
BINGX_API_SECRET=

HTX_WEB_SOCKET=wss://api.hbdm.com/linear-swap-ws
HTX_API_KEY=
HTX_API_SECRET=

DERIBIT_WEB_SOCKET=wss://www.deribit.com/ws/api/v2
DERIBIT_API_KEY=
DERIBIT_API_SECRET=

## EXCHANGE_WEB_SOCKET

- **Description**: It`s a WebSocket URL for connecting to Futures API to get order book, in other exchange you have to send request with specific params (it was written in config)
- **Where to get**: you can see docs for every exchange to get url
- **Why needed**: to get order book data

## EXCHANGES_WEB_SOCKET_TRADE

- **Description**: It`s a WebSocket URL for connecting to Binance Futures API to place order with your params but firstly tou have to login in exchange to place order without delay, on sign every request, to not miss the time. You send request with login params before you get market data an when filter is done script place an order as fast as it can
- **Where to get**: see the docs for every exchange
- **Why needed**: to place order

## BINANCE_PUBLIC_KEY,BINANCE_PRIVATE_URL
- **Description**: Binance have other way to sign request for webSocket trade, Firstly need to create 2 keys in Asymetric Key Generator and take public key and send to binance api to create new API and paste to Line,
  than you get api key which you will yse to send request and private key tou must save in safePlace and use to sign exactly binance login request WS and than send request with order, It's Keys Ed25519 Encoded
- **Where to get**: see the docs for every exchange
- **Why needed**: to sign your login request

## BINANCE_SERVER_GET_TIME_URL
- **Description**: It's ab url to get binance server time to right sign your login request.
- **Where to get**: see the docs for every exchange
- **Why needed**: to sign your login request

## EXCHANGES_API_KEY, EXCHANGES_API_SECRET
- **Description**: These are Keys to get data from every exchange and It's only HMAC SHA256
- **Where to get**: Go to exchang and find your account then you see manage Api and there you have to create api key and api secret
- **Why needed**: to sign your login request
