const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
    teacherId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    course: { 
        type: String, 
        required: true // e.g., "BCA", "BBA"
    }, 
    semester: { 
        type: String, 
        required: true // e.g., "Semester 1", "Semester 6"
    }, 
    subject: { 
        type: String, 
        required: true 
    },
    examName: { 
        type: String, 
        required: true // Teacher manual type karega, e.g., "First Mid-Term"
    }, 
    examDate: { 
        type: Date, 
        required: true 
    },
    maxMarks: { 
        type: Number, 
        required: true 
    },
    studentsMarkList: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional reference to student DB
        rollNo: { type: String, required: true },
        studentName: { type: String, required: true },
        marksObtained: { type: Number, required: true },
        rank: { type: Number, required: true }, // Class Rank based on marks
        remarks: { type: String, default: "" }
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Mark', markSchema);
