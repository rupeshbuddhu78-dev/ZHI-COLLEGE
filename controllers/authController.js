// 📁 controllers/authController.js
const Student = require('../models/Student');
const User = require('../models/User');
const Staff = require('../models/Staff');
const axios = require('axios');

exports.loginUser = async (req, res) => {
    const { role, email, password } = req.body;
    try {
        let user;
        let roleName = role.toLowerCase();

        // 1. User dhoondho
        if (roleName === 'student') {
            user = await Student.findOne({ email });
        } else if (roleName === 'director') {
            user = await User.findOne({ email, role: 'director' });
        } else if (['hod', 'accountant', 'staff', 'teacher'].includes(roleName)) {
            let dbCategory = roleName === 'teacher' ? 'teacher' : 'management';
            user = await Staff.findOne({ email, category: dbCategory });
        }

        if (!user) return res.status(404).json({ success: false, message: "User not found!" });

        // 🔒 2. SECURE PASSWORD CHECK (Jo humne model me banaya tha)
        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid Password!" });

        // 3. Response bhejo
        if (roleName === 'student') {
            return res.status(200).json({ success: true, message: "Welcome Student!", role: "Student", studentId: user._id, studentName: user.studentName /*...baaki details...*/ });
        } else {
            return res.status(200).json({ success: true, message: "Welcome!", role: user.role || role });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error!" });
    }
};

exports.forgotPassword = async (req, res) => {
    let { email } = req.body;
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/.../exec'; // Apna URL daalna
    
    try {
        const emailRegex = new RegExp('^' + email.trim() + '$', 'i');
        let user = await Student.findOne({ email: emailRegex }) || await User.findOne({ email: emailRegex }) || await Staff.findOne({ email: emailRegex });
        
        if (!user) return res.status(404).json({ success: false, message: "Email not found!" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; 
        await user.save();

        let personName = user.name || user.studentName || 'User';
        await axios.post(GOOGLE_SCRIPT_URL, {
            to: user.email, subject: 'ZHI College - Password Reset OTP', body: `Hello ${personName},\n\nYour OTP is: ${otp}`
        });

        res.status(200).json({ success: true, message: "OTP sent successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error!" });
    }
};
