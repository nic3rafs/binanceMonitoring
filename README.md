# Binance Price Change Monitor
This Node.js program monitors the price change of Binance trading pairs and sends a notification to a Telegram chat if the price change exceeds a certain threshold within a specified time frame.

## Prerequisites
To run this program, you will need:

- Node.js (v14 or higher)
- Binance API key and secret
- Telegram bot API token and chat ID
## Setup
- Clone this repository to your local machine.
- Install the required Node.js packages by running the command `npm install`.
- Copy the .env.example file and rename it to .env.
- Edit the .env file and replace the placeholders with your own API keys and chat ID.
## Usage
To start the program, run the command `npm start`.

## Configuration
You can configure the following parameters in the program:

- **threshold**: The threshold for price change, in percentage (default: 10%).
- **timeframe**: The maximum time for price change, in minutes (default: 15 minutes).
- **windowSize**: The size of sliding window, in minutes (default: 15 minutes).
- **deleteAfterDetection**: The number of items to delete when price change detected (default: 15).
- **quoteIds**: The trading pair to monitor (***/BTC and ***/USDT) (default: ["BTC", "USDT"]).
- **timeToSleep**: The time to sleep between price checks, in milliseconds (default: 60000 ms).
- **notificationChat**: The chat ID to send notifications to.
