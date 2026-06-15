const Student = require('../models/Student');
const StudentFee = require('../models/StudentFee'); // Make sure you have these models

exports.addStudent = async (req, res) => {
    try {
        const newStudent = new Student({ ...req.body, password: req.body.studentMobile });
        const savedStudent = await newStudent.save();
        res.status(201).json({ success: true, message: 'Student added successfully!', studentId: savedStudent._id });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Email already exists!' });
        res.status(500).json({ success: false, message: 'Server error!' });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: students });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error!' }); }
};

exports.updateStudent = async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, message: 'Student details updated!', data: updatedStudent });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error!' }); }
};

exports.deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Student deleted successfully!' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error!' }); }
};

exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded!' });
        const student = await Student.findByIdAndUpdate(req.params.id, { profilePicUrl: req.file.path }, { new: true });
        res.status(200).json({ success: true, message: 'Photo Updated!', profilePicUrl: req.file.path });
    } catch (error) { res.status(500).json({ success: false, message: 'Upload failed!' }); }
};
