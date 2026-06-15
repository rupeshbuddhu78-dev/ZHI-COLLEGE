const Mark = require('../models/Mark');

// 🟢 1. UPLOAD MARKS (Ek sath poori class ki marksheet upload hogi)
exports.uploadMarks = async (req, res) => {
    try {
        // Naye schema ke hisaab se saare fields req.body se nikal rahe hain
        const { teacherId, course, sessionBatch, semester, subject, examName, examDate, maxMarks, studentsMarkList } = req.body;

        // Loop hat gaya! Ab ek subject aur exam ke liye ek hi baar database hit hoga
        const updatedMarkSheet = await Mark.findOneAndUpdate(
            { course, sessionBatch, semester, subject, examName }, // Unique Check (Taki duplicate upload na ho)
            { 
                teacherId, course, sessionBatch, semester, subject, examName, examDate, maxMarks, studentsMarkList, status: 'Published' 
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, message: "Marksheet uploaded successfully! 🎉", data: updatedMarkSheet });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// 🟢 2. GET STUDENT MARKS (Array ke andar se student dhoondhna)
exports.getStudentMarks = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Mongoose ko batana padega ki 'studentId' array ke andar hai
        const marks = await Mark.find({ "studentsMarkList.studentId": studentId });

        res.status(200).json({ success: true, data: marks });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
};
