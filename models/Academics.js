const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
    course: { type: String, required: true }, semester: { type: String, required: true },
    section: { type: String, required: true }, subject: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true }, 
    teacherName: { type: String, required: true }, date: { type: String, required: true }, 
    dayOfWeek: { type: String, required: true }, startTime: { type: String, required: true }, 
    endTime: { type: String, required: true }, roomNumber: { type: String } 
}, { timestamps: true });
const Routine = mongoose.model('Routine', routineSchema);

const noteSchema = new mongoose.Schema({
    date: { type: String, required: true }, semester: { type: String, required: true },
    subject: { type: String, required: true }, title: { type: String, required: true },
    fileUrl: { type: String, required: true }, cloudinaryId: { type: String, required: true }, 
}, { timestamps: true });
const Note = mongoose.model('Note', noteSchema);

const teacherAttendanceSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    teacherName: { type: String, required: true }, dateStr: { type: String, required: true }, 
    monthVal: { type: String, required: true }, dayName: { type: String }, 
    punchIn: { type: String, default: "" }, punchOut: { type: String, default: "" }, 
    status: { type: String, default: "Present", enum: ["Present", "Absent", "Leave", "Half Day"] },
    remarks: { type: String, default: "On Time" }
}, { timestamps: true });
teacherAttendanceSchema.index({ teacherId: 1, dateStr: 1 }, { unique: true });
const TeacherAttendance = mongoose.model('TeacherAttendance', teacherAttendanceSchema);

const attendanceSchema = new mongoose.Schema({
    fullDate: { type: Date, required: true }, day: { type: Number, required: true },
    month: { type: String, required: true }, year: { type: Number, required: true },
    batch: { type: String, required: true }, course: { type: String, required: true },
    semester: { type: String, required: true }, subject: { type: String, required: true },
    startTime: { type: String, required: true }, endTime: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, 
    records: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        rollNumber: { type: String, required: true }, studentName: { type: String, required: true },
        status: { type: String, enum: ['P', 'A'], required: true }
    }],
    summary: { totalStudents: { type: Number }, presentCount: { type: Number }, absentCount: { type: Number }, attendancePercentage: { type: Number } }
}, { timestamps: true });
const Attendance = mongoose.model('Attendance', attendanceSchema);

const markSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    course: { type: String, required: true }, sessionBatch: { type: String, required: true }, 
    semester: { type: String, required: true }, subject: { type: String, required: true },
    examName: { type: String, required: true }, examDate: { type: Date, required: true }, maxMarks: { type: Number, required: true },
    studentsMarkList: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, 
        rollNo: { type: String, required: true }, studentName: { type: String, required: true },
        attendanceStatus: { type: String, enum: ['Present', 'Absent', 'Debarred'], default: 'Present' },
        marksObtained: { type: Number, default: 0 }, rank: { type: Number, default: 0 }, remarks: { type: String, default: "" }
    }],
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published' } 
}, { timestamps: true }); 
const Mark = mongoose.model('Mark', markSchema);

module.exports = { Routine, Note, TeacherAttendance, Attendance, Mark };
