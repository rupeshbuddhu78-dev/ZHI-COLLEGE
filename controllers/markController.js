const Mark = require('../models/Mark');

exports.uploadMarks = async (req, res) => {
    try {
        const { course, semester, subject, examType, marks } = req.body;
        for (let record of marks) {
            await Mark.findOneAndUpdate(
                { studentId: record.studentId, subject, examType },
                { course, semester, studentId: record.studentId, subject, examType, marksObtained: record.marksObtained, totalMarks: record.totalMarks },
                { upsert: true, new: true }
            );
        }
        res.status(200).json({ success: true, message: "Marks uploaded successfully!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getStudentMarks = async (req, res) => {
    try {
        const marks = await Mark.find({ studentId: req.params.studentId });
        res.status(200).json({ success: true, data: marks });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
