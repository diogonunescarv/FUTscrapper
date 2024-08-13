const nodemailer = require('nodemailer');
const twilio = require('twilio');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Load variables from .env

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function generatePersonalizedText(formData, filteredResults) {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  let prompt = `Create a personalized notification message for ${formData.name} about players that match their criteria. Here are the players:\n`;
  
  if (filteredResults.length > 0) {
    filteredResults.forEach(player => {
      prompt += `- Name: ${player.Name}, Price: ${player.Price}\n`;
    });
  } else {
    prompt += 'No matching players found.\n';
  }
  
  prompt += 'Include a friendly tone and mention that a new list will be sent in 24 hours. The App name is Futscrapper';

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return text
}

// Function to send email
function sendEmail(formData, notificationText) {
  const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: formData.email,
    subject: 'Player Match Notification',
    text: notificationText,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

// Function to send SMS
function sendSMS(formData, notificationText) {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  client.messages.create({
    body: notificationText,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: formData.phone,
  })
  .then(message => console.log('SMS sent:', message.sid))
  .catch(error => console.log('Error sending SMS:', error));
}

// Main function to send notifications
async function sendNotification(formData, filteredResults) {
  const notificationText = await generatePersonalizedText(formData, filteredResults);

  if (notificationText) {
    if (formData.notificationMethod === 'Email') {
      sendEmail(formData, notificationText);
    } else if (formData.notificationMethod === 'SMS') {
      sendSMS(formData, notificationText);
    } else {
      console.log('Unknown notification method.');
    }
  } else {
    console.log('Failed to generate notification text.');
  }
}

module.exports = sendNotification;
