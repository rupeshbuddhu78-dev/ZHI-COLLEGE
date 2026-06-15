// --- FINAL NODEMAILER CONFIGURATION ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,                   // 🔴 Port 465 hata kar 587 kar diya (Free servers pe ye block nahi hota)
    secure: false,               // 🔴 Port 587 ke liye isko false rakhna padta hai
    requireTLS: true,            // 🔴 Lekin connection secure rahega is line se
    auth: {
        user: '8651142739rupesh@gmail.com',  // Tera naya email
        pass: 'qkylmbcmxnuxiteb'             // Tera 16-digit password
    },
    tls: {
        rejectUnauthorized: false
    }
});
