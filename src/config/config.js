import dotenv from 'dotenv';
dotenv.config();

export const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || '7662460998:AAE7awt2EiWUHbX0wEfV3Y5fqHmq5gUCH2Y',
  apiUrl: 'https://mobile-pre.at.dz/api'
};