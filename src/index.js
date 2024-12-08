import TelegramBot from 'node-telegram-bot-api';
import { config } from './config/config.js';
import { handleMessage, handleCallback } from './handlers/messageHandler.js';

const bot = new TelegramBot(config.telegramToken, { polling: true });

bot.on('message', (msg) => handleMessage(bot, msg));
bot.on('callback_query', (query) => handleCallback(bot, query));

console.log('Algérie Télécom Bot is running...');