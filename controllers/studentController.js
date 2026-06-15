// 📁 controllers/studentController.js
const Student = require('../models/Student');
// Note: Tumhe `generateFeeStructure` aur baaki models yahan import karne honge

exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: students });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error!' }); }
};

exports.deleteStudent = async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) return res.status(404).json({ success: false, message: 'Student not found!' });
        res.status(200).json({ success: true, message: 'Student deleted successfully!' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error!' }); }
};

// ... baaki add-student aur update-student wale function yahan aayenge ...
