const Staff = require('../models/Staff');

exports.addStaff = async (req, res) => {
    try {
        // 🔥 FIX: HTML ke name attributes ('resumeFile', 'certFile') ke mutabik badla
        let profilePicUrl = req.files && req.files['profilePic'] ? req.files['profilePic'][0].path : "";
        let resumeUrl = req.files && req.files['resumeFile'] ? req.files['resumeFile'][0].path : "";
        let certUrl = req.files && req.files['certFile'] ? req.files['certFile'][0].path : "";

        const newStaff = new Staff({ 
            ...req.body, 
            profilePicUrl, 
            resumeUrl, 
            certUrl,
            password: req.body.mobile // Default password mobile number set hoga
        });

        await newStaff.save();
        res.status(201).json({ success: true, message: "Staff added successfully!" });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: "Employee ID already exists!" });
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getStaff = async (req, res) => {
    try {
        const staff = await Staff.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: staff });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateStaff = async (req, res) => {
    try {
        const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, message: "Staff updated!", data: updatedStaff });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteStaff = async (req, res) => {
    try {
        await Staff.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Staff deleted!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
