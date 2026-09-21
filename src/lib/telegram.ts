//src>lib>telegram.ts

"use server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

type TelegramGroup = 'register' | 'deposit' | 'withdraw' | 'transaction';

const GROUP_IDS: Record<TelegramGroup, string | undefined> = {
  register: process.env.TELEGRAM_REGISTER_GROUP_ID,
  deposit: process.env.TELEGRAM_DEPOSIT_GROUP_ID,
  withdraw: process.env.TELEGRAM_WITHDRAW_GROUP_ID,
  transaction: process.env.TELEGRAM_TRANSACTION_GROUP_ID,
};

export async function sendTelegramNoti(group: TelegramGroup, message: string) {
  const chatId = GROUP_IDS[group];
  
  if (!BOT_TOKEN || !chatId) {
    console.error(`Missing Telegram credentials for ${group} group.`);
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}