const Attendance = require('../models/Attendance');
const TeacherAttendance = require('../models/TeacherAttendance');

// Student Attendance
exports.saveStudentAttendance = async (req, res) => {
    try {
        const { date, course, semester, records } = req.body;
        for (let record of records) {
            await Attendance.findOneAndUpdate(
                { date, studentId: record.studentId },
                { date, course, semester, studentId: record.studentId, status: record.status },
                { upsert: true, new: true }
            );
        }
        res.status(200).json({ success: true, message: "Attendance saved successfully!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getStudentAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ date: req.query.date, course: req.query.course, semester: req.query.semester }).populate('studentId', 'studentName collegeRegNo');
        res.status(200).json({ success: true, data: attendance });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// Teacher Punch In/Out
exports.teacherPunch = async (req, res) => {
    try {
        const { staffId, type, time, location } = req.body;
        const today = new Date().toISOString().split('T')[0];
        
        let record = await TeacherAttendance.findOne({ staffId, date: today });
        if (!record) {
            record = new TeacherAttendance({ staffId, date: today });
        }
        
        if (type === 'in') {
            record.punchIn = { time, location };
            record.status = 'Present';
        } else if (type === 'out') {
            record.punchOut = { time, location };
        }
        
        await record.save();
        res.status(200).json({ success: true, message: `Punched ${type} successfully!`, data: record });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
