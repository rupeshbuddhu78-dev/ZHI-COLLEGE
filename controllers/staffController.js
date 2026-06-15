const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs'); // 🔴 Make sure to have bcryptjs installed

exports.addStaff = async (req, res) => {
    try {
        let profilePicUrl = req.files && req.files['profilePic'] ? req.files['profilePic'][0].path : "";
        let resumeUrl = req.files && req.files['resumeFile'] ? req.files['resumeFile'][0].path : "";
        let certUrl = req.files && req.files['certFile'] ? req.files['certFile'][0].path : "";

        // Raw password array structure extraction or fallback handling
        let rawPassword = req.body.password || req.body.mobile;

        // Secure password hashing before saving to DB
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        const newStaff = new Staff({ 
            ...req.body, 
            profilePicUrl, 
            resumeUrl, 
            certUrl,
            password: hashedPassword 
        });

        await newStaff.save();
        res.status(201).json({ success: true, message: "Staff added successfully!" });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Employee ID already exists!" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getStaff = async (req, res) => {
    try {
        const staff = await Staff.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: staff });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
};

exports.updateStaff = async (req, res) => {
    try {
        // dynamic handling to prevent password corruption in standard update fields
        if(req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, message: "Staff updated!", data: updatedStaff });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        await Staff.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Staff deleted!" });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// 🔴 NEW ADDITION: RESET PASSWORD CONTROLLER FUNCTION
exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ success: false, message: "New Password is required!" });
        }

        // Generating safe secure hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedUser = await Staff.findByIdAndUpdate(
            id, 
            { password: hashedPassword }, 
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "Staff member not found!" });
        }

        res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
