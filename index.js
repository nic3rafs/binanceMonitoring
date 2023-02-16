import ccxt from "ccxt";
import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { convertMsToTime, sleep } from "./utils.js";
import chalk from "chalk";
dotenv.config();

/* CONFIGURATION */
const threshold = 0.1; // threshold for price change, 10%
const timeframe = 15; // maximum time for price change, 15 minutes
const windowSize = 15; // size of sliding window, every minute, depending on timeframe
const deleteAfterDetection = 15; // number of itmes to delete when price change detected
const quoteIds = ["BTC", "USDT"]; // What pair to monitor (***/BTC and ***/USDT) for example
const timeToSleep = 60000; // Time to sleep in ms
const notificationChat = process.env.TELEGRAM_BOT_CHAT_ID; // Chat to send notifications

const config = {
  enableRateLimit: true,
  apiKey: process.env.BINANCE_API_KEY,
  secret: process.env.BINANCE_SECRET_KEY,
};
const binance = new ccxt.binance(config);
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

//Logging
const log = (msg) => {
  console.log(
    `[ ${chalk.greenBright(convertMsToTime(Date.now()))} ] --- ${msg}`
  );
};

log(`(INFO) Threshold set to ${threshold * 100}%`);
log(`(INFO) Timeframe - ${timeframe} min`);
log(`(INFO) Window size - ${windowSize} min`);
log(`(INFO) Delete after detection - ${deleteAfterDetection}`);
log(`(INFO) Quotes to check - ${quoteIds}`);
log(`(INFO) Time to sleep set to ${timeToSleep / 1000} seconds`);
log(`(INFO) Notification send in ${notificationChat}`);

// Send notification in telegram
const sendNotification = (symbol, priceChange) => {
  const link = `https://www.binance.com/uk-UA/trade/${symbol
    .split("/")
    .join("_")}`;
  let emoji = "📈";
  if (priceChange < 0) {
    emoji = "📉";
  }
  const message = `${emoji} Ціна на ${symbol} змінилася на ${(
    priceChange * 100
  ).toFixed(2)}% за ${timeframe} хвилин \nПосилання: ${link}`;
  bot.telegram.sendMessage(notificationChat, message);
};

//Get active spot markets with specified quote id
const getSpotMarkets = async (quoteId) => {
  const tradingPairs = await binance.loadMarkets();
  const resultArr = [];

  for (const key in tradingPairs) {
    if (Object.hasOwnProperty.call(tradingPairs, key)) {
      const element = tradingPairs[key];
      if (
        element.type === "spot" &&
        element.active === true &&
        element.quoteId === quoteId
      ) {
        resultArr.push(element.symbol);
      }
    }
  }
  log(`Detected ${resultArr.length} ${quoteId} markets`);
  return resultArr;
};

const checkPriceChange = async (markets) => {
  const marketsData = {};
  let i = 1;
  while (true) {
    log(`(${i}) Started ${chalk.bold("checkPriceChange")}`);
    try {
      const tickers = await binance.fetchTickers(markets);
      for (const key in tickers) {
        if (Object.hasOwnProperty.call(tickers, key)) {
          const ticker = tickers[key];

          // Creating object if no marketdata for symbol
          if (!marketsData[ticker.symbol]) {
            marketsData[ticker.symbol] = [
              {
                price: ticker.last,
                timestamp: Date.now(),
              },
            ];
            continue;
          }
          marketsData[ticker.symbol].push({
            price: ticker.last,
            timestamp: Date.now(),
          });

          //Check if marketdata fully filled, continue until fill, shift if overflow
          if (marketsData[ticker.symbol].length < windowSize) {
            continue;
          } else if (marketsData[ticker.symbol].length > windowSize) {
            marketsData[ticker.symbol].shift();
          }

          if (marketsData[ticker.symbol].length === windowSize) {
            const priceChangeInTimeframe =
              (ticker.last - marketsData[ticker.symbol][0].price) /
              marketsData[ticker.symbol][0].price;
            if (Math.abs(priceChangeInTimeframe) >= threshold) {
              log(
                `Price change in ${ticker.symbol} on ${(
                  priceChangeInTimeframe * 100
                ).toFixed(2)} in ${convertMsToTime(
                  Date.now() - marketsData[ticker.symbol][0].timestamp
                )} Detected`
              );
              sendNotification(ticker.symbol, priceChangeInTimeframe);
              marketsData[ticker.symbol].splice(0, deleteAfterDetection);
            }
          }
        }
      }
      log(
        `(${i}) Finished ${chalk.bold(
          "checkPriceChange"
        )}, sleeping ${timeToSleep}ms`
      );
      i++;
      await sleep(timeToSleep);
    } catch (error) {
      console.log(error);
    }
  }
};

const main = async () => {
  log("Start");
  let markets = [];
  for (const quoteId of quoteIds) {
    const marketsArr = await getSpotMarkets(quoteId);
    markets.push(...marketsArr);
  }
  checkPriceChange(markets);
};
main();
