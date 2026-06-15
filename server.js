require('dotenv').config(); // Sabse upar taaki .env file read ho sake
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// --- 📂 UTILITIES IMPORT ---
const seedAdmin = require('./utils/seeder');
const keepAlive = require('./utils/keepAlive');

// --- 🛣️ ROUTES IMPORT ---
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const financeRoutes = require('./routes/financeRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const noteRoutes = require('./routes/noteRoutes');
const markRoutes = require('./routes/markRoutes');
const routineRoutes = require('./routes/routineRoutes');

// --- ⚙️ APP SETUP ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. MIDDLEWARES ---
app.use(cors());
app.use(express.json()); // JSON data ko samajhne ke liye
app.use(express.static(path.join(__dirname, 'public'))); // Frontend files serve karne ke liye

// --- 2. DATABASE CONNECTION ---
// Dhyan rahe: .env file mein MONGO_URI set hona chahiye
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Cloud MongoDB Connected Successfully! 🔥");
        seedAdmin(); // Server start hote hi check karega ki Admin hai ya nahi
    })
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// --- 3. API ROUTES (Connections) ---
// Yahan humne har feature ko ek specific rasta (URL prefix) de diya hai
app.use('/api', authRoutes);                   // Auth: /api/login, /api/forgot-password
app.use('/api/students', studentRoutes);       // Students: /api/students/add-student, etc.
app.use('/api/staff', staffRoutes);            // Staff: /api/staff/
app.use('/api/finance', financeRoutes);        // Finance: /api/finance/fee, /api/finance/expense
app.use('/api/notices', noticeRoutes);         // Notices: /api/notices/
app.use('/api/attendance', attendanceRoutes);  // Attendance: /api/attendance/save, etc.
app.use('/api/leaves', leaveRoutes);           // Leaves: /api/leaves/apply
app.use('/api/notes', noteRoutes);             // Notes: /api/notes/upload
app.use('/api/marks', markRoutes);             // Marks: /api/marks/upload
app.use('/api/routines', routineRoutes);       // Routines: /api/routines/

// --- 4. FRONTEND CATCH-ALL ROUTE ---
// 🔥 FIX: Naye path-to-regexp engine ke liye '*' ko '(.*)' se replace kiya hai
app.get('(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- 5. START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Secure Modular Server Running on port ${PORT}!`);
    keepAlive(); // Render/Glitch pe server ko sone se bachane ke liye
});
