// 📁 config/email.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // .env file ko read karne ke liye

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,                   
    secure: false,               
    requireTLS: true,            
    auth: {
        // 🔥 Ab keys .env file se safely aa rahi hain
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS   
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Transporter ko export kar rahe hain taaki kisi bhi controller mein use kar sakein
module.exports = transporter;
