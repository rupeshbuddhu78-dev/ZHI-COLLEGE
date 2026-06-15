const Student = require('../models/Student');
const User = require('../models/User');
const Staff = require('../models/Staff');
const axios = require('axios');

exports.loginUser = async (req, res) => {
    const { role, email, password } = req.body;
    try {
        let user;
        let roleName = role.toLowerCase();

        if (roleName === 'student') user = await Student.findOne({ email });
        else if (roleName === 'director') user = await User.findOne({ email, role: 'director' });
        else if (['hod', 'accountant', 'staff', 'teacher'].includes(roleName)) {
            let dbCategory = roleName === 'teacher' ? 'teacher' : 'management';
            user = await Staff.findOne({ email, category: dbCategory });
        }

        if (!user) return res.status(404).json({ success: false, message: "User nahi mila!" });

        // Secure Bcrypt check 
        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid Email or Password!" });

        if (roleName === 'student') {
            return res.status(200).json({ success: true, message: "Welcome Student!", role: "Student", studentId: user._id, studentName: user.studentName });
        } else {
            if (user.status === 'Disabled') return res.status(403).json({ success: false, message: "Account disabled!" });
            return res.status(200).json({ success: true, message: "Welcome " + (user.name || "Admin"), role: role });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error!" });
    }
};

exports.forgotPassword = async (req, res) => {
    let { email } = req.body;
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlYFfak-GF51cTGRspEwU6S1fKP2a3wvyn4uEdNfkmvjJHSxk5_ir7ilFBvXzulE4xMA/exec';
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
            to: user.email, subject: 'ZHI College - Password Reset OTP', body: `Hello ${personName},\n\nYour Password Reset OTP is: ${otp}`
        });
        res.status(200).json({ success: true, message: "OTP sent successfully!" });
    } catch (err) { res.status(500).json({ success: false, message: "Internal server error!" }); }
};

exports.resetPassword = async (req, res) => {
    let { email, otp, newPassword } = req.body;
    try {
        const emailRegex = new RegExp('^' + email.trim() + '$', 'i');
        let user = await Student.findOne({ email: emailRegex }) || await User.findOne({ email: emailRegex }) || await Staff.findOne({ email: emailRegex });

        if (!user || user.resetOtp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or Expired OTP!" });
        }
        user.password = newPassword; user.resetOtp = undefined; user.otpExpiry = undefined;
        await user.save();
        res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (err) { res.status(500).json({ success: false, message: "Server error!" }); }
};
