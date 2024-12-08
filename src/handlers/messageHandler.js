import { config } from '../config/config.js';
import { APIClient } from '../utils/api.js';
import { formatAccountInfo } from '../utils/formatter.js';

const api = new APIClient(config.apiUrl);
const userStates = new Map();
const userSessions = new Map();

export async function handleMessage(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    userStates.set(chatId, 'WAITING_ND');
    await bot.sendMessage(
      chatId,
      "🌟 Welcome to Algérie Télécom Bot!\n\nPlease enter your ND (phone number):"
    );
    return;
  }

  if (text === '/help') {
    await bot.sendMessage(
      chatId,
      "📚 Available Commands:\n\n" +
      "/start - Begin login process\n" +
      "/help - Show this help message\n" +
      "/logout - Logout from your account"
    );
    return;
  }

  if (text === '/logout') {
    userStates.delete(chatId);
    userSessions.delete(chatId);
    await bot.sendMessage(chatId, "You have been logged out. Send /start to login again.");
    return;
  }

  const currentState = userStates.get(chatId);

  if (currentState === 'WAITING_ND') {
    if (!text.match(/^\d+$/)) {
      await bot.sendMessage(chatId, "⚠️ Please enter a valid number.");
      return;
    }
    userSessions.set(chatId, { nd: text });
    userStates.set(chatId, 'WAITING_PASSWORD');
    await bot.sendMessage(chatId, "Please enter your password:");
    return;
  }

  if (currentState === 'WAITING_PASSWORD') {
    const userData = userSessions.get(chatId);
    try {
      const loginResponse = await api.login(userData.nd, text);
      
      if (loginResponse?.meta_data?.original?.token) {
        const token = loginResponse.meta_data.original.token;
        userData.token = token;
        userSessions.set(chatId, userData);
        
        const accountInfo = await api.getAccountInfo(token);
        const keyboard = {
          inline_keyboard: [
            [{ text: "Account Information", callback_data: "account_info" }],
            [{ text: "Available Speeds", callback_data: "check_speeds" }],
            [{ text: "Logout", callback_data: "logout" }]
          ]
        };

        await bot.sendMessage(
          chatId,
          `✅ Login Successful!\n\nWelcome ${loginResponse.data.original.prenom} ${loginResponse.data.original.nom}`,
          { reply_markup: keyboard }
        );
        userStates.set(chatId, 'LOGGED_IN');
      } else {
        await bot.sendMessage(chatId, "❌ Login failed. Please check your credentials and try again.");
        userStates.set(chatId, 'WAITING_ND');
      }
    } catch (error) {
      console.error('Login error:', error);
      await bot.sendMessage(chatId, "❌ An error occurred during login. Please try again later.");
      userStates.set(chatId, 'WAITING_ND');
    }
    return;
  }
}

export async function handleCallback(bot, query) {
  const chatId = query.message.chat.id;
  const userData = userSessions.get(chatId);

  await bot.answerCallbackQuery(query.id);

  if (!userData?.token) {
    await bot.sendMessage(chatId, "Session expired. Please /start again to login.");
    return;
  }

  try {
    switch (query.data) {
      case 'account_info': {
        const accountInfo = await api.getAccountInfo(userData.token);
        const keyboard = {
          inline_keyboard: [
            [{ text: "Check Available Speeds", callback_data: "check_speeds" }],
            [{ text: "Back to Menu", callback_data: "main_menu" }],
            [{ text: "Logout", callback_data: "logout" }]
          ]
        };
        await bot.editMessageText(formatAccountInfo(accountInfo), {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: keyboard
        });
        break;
      }
      
      case 'check_speeds': {
        const accountInfo = await api.getAccountInfo(userData.token);
        const speeds = accountInfo.listOffreDebit?.split(',') || [];
        const speedText = "🚀 Available Speed Options:\n\n" + 
          speeds.map(speed => `• ${speed}`).join('\n');
        
        const keyboard = {
          inline_keyboard: [
            [{ text: "Back", callback_data: "account_info" }]
          ]
        };
        
        await bot.editMessageText(speedText, {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: keyboard
        });
        break;
      }

      case 'main_menu': {
        const keyboard = {
          inline_keyboard: [
            [{ text: "Account Information", callback_data: "account_info" }],
            [{ text: "Available Speeds", callback_data: "check_speeds" }],
            [{ text: "Logout", callback_data: "logout" }]
          ]
        };
        await bot.editMessageText("Main Menu", {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: keyboard
        });
        break;
      }

      case 'logout':
        userStates.delete(chatId);
        userSessions.delete(chatId);
        await bot.editMessageText(
          "You have been logged out. Send /start to login again.",
          {
            chat_id: chatId,
            message_id: query.message.message_id
          }
        );
        break;
    }
  } catch (error) {
    console.error('Callback error:', error);
    await bot.sendMessage(chatId, "❌ An error occurred. Please try again.");
  }
}