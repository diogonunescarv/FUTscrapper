// helpers/notification.js

const nodemailer = require('nodemailer');
const twilio = require('twilio');
//const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Carregar variáveis do .env

// Função para criar o texto da notificação
function createNotificationText(formData, filteredResults) {
  let notificationText = `Olá ${formData.name},\n\n`;
  notificationText += `Encontramos jogadores que correspondem aos critérios de busca:\n\n`;
  
  if (filteredResults.length > 0) {
    filteredResults.forEach(player => {
      notificationText += `- Nome: ${player.Name}, Preço: ${player.Price}\n`;
    });
  } else {
    notificationText += 'Nenhum jogador correspondente encontrado.\n';
  }
  
  notificationText += `\nDaqui 24 horas, uma nova lista será enviada.\n`;
  notificationText += `Atenciosamente,\nSua Equipe de Notificações`;
  
  return notificationText;
}

// Função para enviar e-mail
function sendEmail(formData, notificationText) {
  console.log(process.env.EMAIL_USER)
  console.log(process.env.EMAIL_PASS)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // Ou 587
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: formData.email,
    subject: 'Notificação de Jogadores Encontrados',
    text: notificationText
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Erro ao enviar e-mail:', error);
    } else {
      console.log('E-mail enviado:', info.response);
    }
  });
}

// Função para enviar SMS
function sendSMS(formData, notificationText) {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  client.messages.create({
    body: notificationText,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: formData.phone
  })
  .then(message => console.log('SMS enviado:', message.sid))
  .catch(error => console.log('Erro ao enviar SMS:', error));
}

// Função para enviar mensagem no Telegram
function sendTelegramMessage(formData, notificationText) {
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

  bot.sendMessage(formData.telegramChatId, notificationText)
    .then(response => console.log('Mensagem enviada pelo Telegram:', response))
    .catch(error => console.log('Erro ao enviar mensagem pelo Telegram:', error));
}

// Função principal para enviar notificações
function sendNotification(formData, filteredResults) {
  const notificationText = createNotificationText(formData, filteredResults);

  if (formData.notificationMethod === 'Email') {
    sendEmail(formData, notificationText);
  } else if (formData.notificationMethod === 'SMS') {
    sendSMS(formData, notificationText);
  } else if (formData.notificationMethod === 'Telegram') {
    sendTelegramMessage(formData, notificationText);
  } else {
    console.log('Método de notificação desconhecido.');
  }
}

module.exports = sendNotification;
