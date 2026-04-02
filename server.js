const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer'); 
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const https = require('https'); 

// ==========================================
// 🟢 MODELS IMPORT (Schemas alag files se aaye hain) 🟢
// ==========================================
const { User, Student, Staff } = require('./models/Users');
const { StudentFee, Transaction, Expense, generateFeeStructure } = require('./models/Finance');
const { Routine, Note, TeacherAttendance, Attendance, Mark } = require('./models/Academics');
const { Notice, Leave } = require('./models/Communication');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 🟢 MIDDLEWARE 🟢
// ==========================================
app.use(cors());
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 🟢 CLOUDINARY & MULTER SETUP 🟢
// ==========================================
cloudinary.config({ 
    cloud_name: 'dzbpiv7ds', 
    api_key: '812196161439545', 
    api_secret: 'gWdxF2wJvGeuMqvpDgmNogS2pdY',
    secure: true 
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'ZhiStudentProfiles', allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'] },
});
const upload = multer({ storage: storage });

const noticeStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'ZhiNotices', resource_type: 'auto' },
});
const uploadNotice = multer({ storage: noticeStorage });

const staffStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'ZhiStaffFiles', resource_type: 'auto', allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx'] },
});
const uploadStaff = multer({ storage: staffStorage });

const noteStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'ZhiNotes', resource_type: 'auto' },
});
const uploadNote = multer({ storage: noteStorage });

const leaveStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'ZhiLeaves', resource_type: 'auto' },
});
const uploadLeave = multer({ storage: leaveStorage });

// ==========================================
// 🟢 DATABASE CONNECTION 🟢
// ==========================================
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://rupeshdatabase:rupeshkumar9091@cluster0.2zu9ek1.mongodb.net/zhi_college?retryWrites=true&w=majority")
.then(() => console.log("✅ Cloud MongoDB Connected Successfully! 🔥"))
.catch((err) => console.log("❌ MongoDB Connection Error:", err));

// ==========================================
// 🟢 EMAIL SETUP 🟢
// ==========================================
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'rupesh.c.0828@zhi.org.in', 
        pass: 'dyju pxba misf qfuk' 
    }
});

// ==========================================
// 🟢 API ROUTES START 🟢
// ==========================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- LOGIN API ---
app.post('/api/login', async (req, res) => {
    const { role, email, password } = req.body;
    try {
        if (role.toLowerCase() === 'student') {
            const student = await Student.findOne({ email, password });
            if (student) {
                return res.status(200).json({ 
                    success: true, message: "Welcome Student!", role: "Student", 
                    studentId: student._id, studentName: student.studentName,
                    course: student.course || "N/A", semester: student.semester || "N/A",  
                    email: student.email, registrationNo: student.collegeRegNo || "N/A",   
                    regDate: student.registrationDate || "N/A", dob: student.dob || "N/A",
                    gender: student.gender || "N/A", bloodGroup: (student.bloodGroup && student.bloodGroup.trim() !== "") ? student.bloodGroup : "N/A", 
                    category: student.category || "N/A", religion: student.religion || "N/A",
                    profilePicUrl: student.profilePicUrl || "" 
                });
            }
        } 
        else if (role.toLowerCase() === 'director') {
            const user = await User.findOne({ email, password, role: 'director' });
            if (user) return res.status(200).json({ success: true, message: "Welcome Admin!", role: user.role });
        } 
        else if (['hod', 'accountant', 'staff', 'teacher'].includes(role.toLowerCase())) {
            let dbCategory = role.toLowerCase() === 'teacher' ? 'teacher' : 'management';
            const staffUser = await Staff.findOne({ email, password, category: dbCategory });
            if (staffUser) {
                if (staffUser.status === 'Disabled') return res.status(403).json({ success: false, message: "Account disabled." });
                return res.status(200).json({ success: true, message: "Welcome " + staffUser.name, role: role, staffId: staffUser._id, staffName: staffUser.name });
            }
        }
        res.status(401).json({ success: false, message: "Invalid Email or Password!" });
    } catch (err) { res.status(500).json({ success: false, message: "Server Error!" }); }
});

// --- STUDENT APIs ---
app.post('/api/add-student', async (req, res) => {
    try {
        const newStudent = new Student({ ...req.body, password: req.body.studentMobile });
        const savedStudent = await newStudent.save();

        let feeData = generateFeeStructure(savedStudent.course);
        let collected = Number(req.body.amountCollected) || 0;
        
        if (collected > 0) {
            feeData.totalPaid = collected;
            feeData.totalDue = feeData.totalAmount - collected;
            
            let remainingAmount = collected;
            for (let head of feeData.feeHeads) {
                if (remainingAmount <= 0) break;
                if (remainingAmount >= head.due) {
                    remainingAmount -= head.due; head.paid = head.due; head.due = 0; head.status = "Paid";
                } else {
                    head.paid = remainingAmount; head.due -= remainingAmount; head.status = "Partial"; remainingAmount = 0;
                }
            }

            const newTxn = new Transaction({
                receiptNo: "REC" + Date.now() + Math.floor(Math.random() * 100), 
                studentId: savedStudent._id, date: new Date(), mode: req.body.paymentMode || "Cash",
                amount: collected, feeHeadName: "Admission Fee (Auto Distributed)",
                remarks: req.body.transactionId || "Admission Time Payment",
                payerMobile: req.body.studentMobile || req.body.fatherMobile
            });
            await newTxn.save();
        }

        const studentFee = new StudentFee({
            studentId: savedStudent._id, totalAmount: feeData.totalAmount,
            totalDiscount: feeData.totalDiscount, totalPaid: feeData.totalPaid,
            totalDue: feeData.totalDue, feeHeads: feeData.feeHeads
        });
        await studentFee.save();

        res.status(201).json({ success: true, message: 'Student & Fee Record added successfully!', studentId: savedStudent._id });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Email already exists!' });
        res.status(500).json({ success: false, message: 'Server error!' });
    }
});

app.post('/api/upload-photo/:id', upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded!' });
        const student = await Student.findByIdAndUpdate(req.params.id, { profilePicUrl: req.file.path }, { new: true });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found!' });
        res.status(200).json({ success: true, message: 'Photo Updated!', profilePicUrl: req.file.path });
    } catch (error) { res.status(500).json({ success: false, message: 'Upload failed!' }); }
});

app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: students });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error!' }); }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStudent) return res.status(404).json({ success: false, message: 'Student not found!' });
        res.status(200).json({ success: true, message: 'Student details updated!', data: updatedStudent });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error!' }); }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) return res.status(404).json({ success: false, message: 'Student not found!' });
        res.status(200).json({ success: true, message: 'Student deleted successfully!' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error!' }); }
});

// --- FORGOT PASSWORD APIs ---
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        let user = await Student.findOne({ email }) || await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "Email not found!" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp; user.otpExpiry = Date.now() + 10 * 60 * 1000; 
        await user.save();

        await transporter.sendMail({
            from: 'rupesh.c.0828@zhi.org.in', to: user.email,
            subject: 'ZHI App - OTP', text: `Aapka Password Reset OTP hai: ${otp}. Yeh 10 mins tak valid hai.`
        });
        res.status(200).json({ success: true, message: "OTP sent to your email!" });
    } catch (err) { res.status(500).json({ success: false, message: "Error sending email!" }); }
});

app.post('/api/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        let user = await Student.findOne({ email }) || await User.findOne({ email });
        if (!user || user.resetOtp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or Expired OTP!" });
        }
        user.password = newPassword; user.resetOtp = undefined; user.otpExpiry = undefined;
        await user.save();
        res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (err) { res.status(500).json({ success: false, message: "Server error!" }); }
});

// --- FINANCE APIs ---
app.get('/api/finance/search-student', async (req, res) => {
    try {
        const { q, course, sem, batch } = req.query;
        let filterQuery = {};
        
        if (q && q.trim() !== "") {
            filterQuery.$or = [
                { studentName: new RegExp(q, 'i') }, 
                { collegeRegNo: new RegExp(q, 'i') }, 
                { studentMobile: new RegExp(q, 'i') }
            ];
        }
        if (course && course !== "") filterQuery.course = new RegExp(course, 'i');
        if (sem && sem !== "") filterQuery.semester = sem;
        if (batch && batch !== "") filterQuery.sessionBatch = new RegExp(batch, 'i');

        const students = await Student.find(filterQuery).select('_id studentName collegeRegNo course sessionBatch semester');
        res.status(200).json({ success: true, data: students });
    } catch (err) { res.status(500).json({ success: false, message: "Error searching students" }); }
});

app.get('/api/finance/student-fee/:studentId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if(!student) return res.status(404).json({ success: false, message: "Student not found!" });

        let feeRecord = await StudentFee.findOne({ studentId: student._id }).populate('studentId', 'studentName collegeRegNo course semester sessionBatch');
        if (!feeRecord) {
            const structure = generateFeeStructure(student.course || "BCA");
            feeRecord = new StudentFee({ studentId: student._id, ...structure });
            await feeRecord.save();
            feeRecord = await StudentFee.findOne({ studentId: student._id }).populate('studentId', 'studentName collegeRegNo course semester sessionBatch');
        }
        res.status(200).json({ success: true, data: feeRecord });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/finance/collect-fee', async (req, res) => {
    const { studentId, headId, amount, mode, remarks, date, payerMobile } = req.body;
    try {
        let feeRecord = await StudentFee.findOne({ studentId });
        if(!feeRecord) return res.status(404).json({ success: false, message: "Ledger not found!" });

        const headIndex = feeRecord.feeHeads.findIndex(h => h._id.toString() === headId);
        if(headIndex === -1) return res.status(400).json({ success: false, message: "Fee head not found!" });

        feeRecord.feeHeads[headIndex].paid += Number(amount);
        feeRecord.feeHeads[headIndex].due -= Number(amount);
        if(feeRecord.feeHeads[headIndex].due <= 0) feeRecord.feeHeads[headIndex].status = "Paid";

        feeRecord.totalPaid += Number(amount);
        feeRecord.totalDue -= Number(amount);
        await feeRecord.save();

        const receiptNo = "REC" + Math.floor(100000 + Math.random() * 900000);
        const newTrans = new Transaction({
            receiptNo, studentId, amount, mode, date: date || new Date(), 
            feeHeadName: feeRecord.feeHeads[headIndex].headName, remarks, payerMobile
        });
        await newTrans.save();

        res.status(200).json({ success: true, message: "Fee Collected Successfully!", receipt: newTrans });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/finance/dashboard', async (req, res) => {
    try {
        const transactions = await Transaction.find().populate('studentId', 'studentName collegeRegNo course').sort({createdAt: -1}).limit(20);
        const expenses = await Expense.find().sort({createdAt: -1}).limit(20);
        const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        const allFees = await StudentFee.find();
        const totalDue = allFees.reduce((sum, f) => sum + f.totalDue, 0);

        res.status(200).json({ success: true, stats: { income: totalIncome, expense: totalExpense, due: totalDue, balance: totalIncome - totalExpense }, transactions, expenses });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/finance/expense', async (req, res) => {
    try {
        const voucherNo = "EXP" + Math.floor(1000 + Math.random() * 9000);
        const exp = new Expense({ voucherNo, ...req.body });
        await exp.save();
        res.status(201).json({ success: true, message: "Expense Recorded!" });
    } catch (err) { res.status(500).json({ success: false }); }
});

// --- GLOBAL NOTICE APIs ---
app.post('/api/notices', uploadNotice.single('attachment'), async (req, res) => {
    try {
        const { title, message, priority, audience, postedBy } = req.body;
        let fileUrl = "";
        if (req.file) {
            let tempUrl = req.file.secure_url || req.file.path;
            fileUrl = tempUrl.replace(/\.pdf$/i, '.png'); 
        }

        let parsedAudience = [];
        try { parsedAudience = JSON.parse(audience); } catch (e) { parsedAudience = audience ? audience.split(',') : []; }

        const newNotice = new Notice({ title, message, priority, audience: parsedAudience, fileUrl, postedBy: postedBy || "Director Office" });
        await newNotice.save();
        res.status(201).json({ success: true, message: "Notice sent successfully!", data: newNotice });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.get('/api/notices', async (req, res) => {
    try {
        const { targetRole } = req.query;
        let filter = {};
        if (targetRole) filter.audience = targetRole;
        const notices = await Notice.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notices });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.put('/api/notices/:id', uploadNotice.single('attachment'), async (req, res) => {
    try {
        const { title, message, priority, audience, postedBy } = req.body;
        let updateData = { title, message, priority };
        if (postedBy) updateData.postedBy = postedBy;

        if (audience) {
            try { updateData.audience = JSON.parse(audience); } catch (e) { updateData.audience = audience.split(','); }
        }
        
        if (req.file) {
            let tempUrl = req.file.secure_url || req.file.path;
            updateData.fileUrl = tempUrl.replace(/\.pdf$/i, '.png'); 
        }

        const updatedNotice = await Notice.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedNotice) return res.status(404).json({ success: false, message: "Notice not found!" });
        res.status(200).json({ success: true, message: "Notice updated successfully!", data: updatedNotice });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.delete('/api/notices/:id', async (req, res) => {
    try {
        const deletedNotice = await Notice.findByIdAndDelete(req.params.id);
        if (!deletedNotice) return res.status(404).json({ success: false, message: "Notice not found!" });
        res.status(200).json({ success: true, message: "Notice deleted permanently!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// --- LEAVE MANAGEMENT APIs ---
app.get('/api/leaves', async (req, res) => {
    try {
        const leaves = await Leave.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: leaves });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.post('/api/leaves/apply', uploadLeave.single('document'), async (req, res) => {
    try {
        const { applicantId, applicantName, applicantRole, leaveType, startDate, endDate, totalDays, reason } = req.body;
        
        let documentUrl = "";
        if (req.file) {
            let tempUrl = req.file.secure_url || req.file.path;
            documentUrl = tempUrl.replace(/\.pdf$/i, '.png'); 
        }

        const newLeave = new Leave({ applicantId, applicantName, applicantRole, leaveType, startDate, endDate, totalDays: Number(totalDays), reason, documentUrl });
        await newLeave.save();
        res.status(201).json({ success: true, message: "Leave application submitted successfully!", data: newLeave });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.post('/api/leaves/update-status', async (req, res) => {
    try {
        const { id, status, remark } = req.body;
        const updatedLeave = await Leave.findByIdAndUpdate(id, { status: status, hodRemark: remark }, { new: true });
        if (!updatedLeave) return res.status(404).json({ success: false, message: "Leave record not found!" });
        res.status(200).json({ success: true, message: `Leave ${status} successfully!`, data: updatedLeave });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// --- STAFF MANAGEMENT APIs ---
app.post('/api/staff', uploadStaff.single('profilePic'), async (req, res) => {
    try {
        let profilePicUrl = req.file ? req.file.path : "";
        const newStaff = new Staff({ ...req.body, profilePicUrl });
        await newStaff.save();
        res.status(201).json({ success: true, message: "Staff Member Added!" });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: "Emp ID already exists!" });
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/staff', async (req, res) => {
    try {
        const staff = await Staff.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: staff });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.delete('/api/staff/:id', async (req, res) => {
    try {
        await Staff.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Staff deleted successfully!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// --- ROUTINE APIs ---
app.post('/api/routines', async (req, res) => {
    try {
        const newRoutine = new Routine(req.body);
        await newRoutine.save();
        res.status(201).json({ success: true, message: "Routine added successfully!", data: newRoutine });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.get('/api/routines', async (req, res) => {
    try {
        const { course, semester, dayOfWeek, teacherId } = req.query;
        let filter = {};
        if (course) filter.course = course;
        if (semester) filter.semester = semester;
        if (dayOfWeek) filter.dayOfWeek = dayOfWeek;
        if (teacherId) filter.teacherId = teacherId;

        const routines = await Routine.find(filter).populate('teacherId', 'name empId').sort({ startTime: 1 });
        res.status(200).json({ success: true, data: routines });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.delete('/api/routines/:id', async (req, res) => {
    try {
        await Routine.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Routine deleted!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// --- STUDY NOTES APIs ---
app.post('/api/notes', uploadNote.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "Please upload a file (PDF/Image)." });
        const { date, semester, subject, title } = req.body;
        const newNote = new Note({ date, semester, subject, title, fileUrl: req.file.path, cloudinaryId: req.file.filename });
        await newNote.save();
        res.status(201).json({ success: true, message: "Note uploaded successfully!", data: newNote });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.get('/api/notes', async (req, res) => {
    try {
        const { semester, subject } = req.query;
        let filter = {};
        if (semester) filter.semester = semester;
        if (subject) filter.subject = subject;

        const notes = await Note.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notes });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.delete('/api/notes/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ success: false, message: "Note not found!" });
        await cloudinary.uploader.destroy(note.cloudinaryId);
        await Note.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Note deleted successfully!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// --- TEACHER ATTENDANCE APIs ---
app.post('/api/teacher-attendance', async (req, res) => {
    try {
        const { teacherId, teacherName, dateStr, monthVal, dayName, status, punchIn, remarks } = req.body;
        const existingRecord = await TeacherAttendance.findOne({ teacherId, dateStr });
        
        if (existingRecord) {
            existingRecord.punchIn = punchIn || existingRecord.punchIn;
            existingRecord.status = status || existingRecord.status;
            existingRecord.remarks = remarks || existingRecord.remarks;
            await existingRecord.save();
            return res.status(200).json({ success: true, message: "Attendance Updated!", data: existingRecord });
        } else {
            const newRecord = new TeacherAttendance({ teacherId, teacherName, dateStr, monthVal, dayName, status, punchIn, remarks });
            await newRecord.save();
            return res.status(201).json({ success: true, message: "Attendance Marked!", data: newRecord });
        }
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.post('/api/teacher-attendance/punch-out', async (req, res) => {
    try {
        const { teacherId, dateStr, punchOut } = req.body;
        const record = await TeacherAttendance.findOne({ teacherId, dateStr });
        if (!record) return res.status(404).json({ success: false, message: "No punch-in record found for today!" });
        
        record.punchOut = punchOut;
        await record.save();
        res.status(200).json({ success: true, message: "Punched Out Successfully!", data: record });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.get('/api/teacher-attendance', async (req, res) => {
    try {
        const { dateStr, teacherId, monthVal } = req.query;
        let filter = {};
        if (dateStr) filter.dateStr = dateStr;
        if (teacherId) filter.teacherId = teacherId;
        if (monthVal) filter.monthVal = monthVal;

        const records = await TeacherAttendance.find(filter).populate('teacherId', 'name empId').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: records });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// --- STUDENT ATTENDANCE APIs ---
app.post('/api/attendance', async (req, res) => {
    try {
        const { fullDate, batch, course, semester, subject, startTime, endTime, teacherId, records } = req.body;
        
        const dateObj = new Date(fullDate);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('en-US', { month: 'short' }); 
        const year = dateObj.getFullYear();

        const totalStudents = records.length;
        const presentCount = records.filter(r => r.status === 'P').length;
        const absentCount = records.filter(r => r.status === 'A').length;
        const attendancePercentage = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

        const attendanceData = {
            fullDate: dateObj, day, month, year, batch, course, semester, subject, startTime, endTime, teacherId, records,
            summary: { totalStudents, presentCount, absentCount, attendancePercentage }
        };

        const existingRecord = await Attendance.findOne({ fullDate: dateObj, batch, course, semester, subject });

        if (existingRecord) {
            existingRecord.records = records;
            existingRecord.summary = attendanceData.summary;
            existingRecord.teacherId = teacherId;
            await existingRecord.save();
            return res.status(200).json({ success: true, message: "Attendance updated successfully!" });
        } else {
            const newAttendance = new Attendance(attendanceData);
            await newAttendance.save();
            return res.status(201).json({ success: true, message: "Attendance saved successfully!" });
        }
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.get('/api/attendance', async (req, res) => {
    try {
        const { date, batch, course, semester, subject } = req.query;
        let filter = {};
        if (date) filter.fullDate = new Date(date);
        if (batch) filter.batch = batch;
        if (course) filter.course = course;
        if (semester) filter.semester = semester;
        if (subject) filter.subject = subject;

        const records = await Attendance.find(filter).populate('teacherId', 'name empId');
        res.status(200).json({ success: true, data: records });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// --- EXAM MARKS APIs ---
app.post('/api/marks', async (req, res) => {
    try {
        const { teacherId, course, sessionBatch, semester, subject, examName, examDate, maxMarks, studentsMarkList } = req.body;
        
        let existingMarkRecord = await Mark.findOne({ course, sessionBatch, semester, subject, examName });

        if (existingMarkRecord) {
            existingMarkRecord.studentsMarkList = studentsMarkList;
            existingMarkRecord.examDate = new Date(examDate);
            existingMarkRecord.maxMarks = maxMarks;
            existingMarkRecord.teacherId = teacherId;
            
            await existingMarkRecord.save();
            return res.status(200).json({ success: true, message: "Marks Updated Successfully!", data: existingMarkRecord });
        } else {
            const newMarkRecord = new Mark({
                teacherId, course, sessionBatch, semester, subject, examName, 
                examDate: new Date(examDate), maxMarks, studentsMarkList
            });
            await newMarkRecord.save();
            return res.status(201).json({ success: true, message: "Marks Uploaded Successfully!", data: newMarkRecord });
        }
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: "Marks for this exam already exist!" });
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/marks', async (req, res) => {
    try {
        const { course, sessionBatch, semester, subject, examName } = req.query;
        let filter = {};
        
        if (course) filter.course = course;
        if (sessionBatch) filter.sessionBatch = sessionBatch;
        if (semester) filter.semester = semester;
        if (subject) filter.subject = subject;
        if (examName) filter.examName = examName;

        const marks = await Mark.find(filter)
            .populate('teacherId', 'name empId')
            .populate('studentsMarkList.studentId', 'studentName collegeRegNo');

        res.status(200).json({ success: true, data: marks });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.get('/api/student-marks/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const allMarks = await Mark.find({ "studentsMarkList.studentId": studentId })
            .populate('teacherId', 'name')
            .sort({ examDate: -1 });

        const formattedMarks = allMarks.map(exam => {
            const studentRecord = exam.studentsMarkList.find(s => s.studentId.toString() === studentId);
            return {
                examName: exam.examName, subject: exam.subject, semester: exam.semester,
                examDate: exam.examDate, teacher: exam.teacherId ? exam.teacherId.name : "Faculty",
                maxMarks: exam.maxMarks, attendanceStatus: studentRecord.attendanceStatus,
                marksObtained: studentRecord.marksObtained, rank: studentRecord.rank, remarks: studentRecord.remarks
            };
        });

        res.status(200).json({ success: true, data: formattedMarks });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// --- SEED ADMIN ---
const seedAdmin = async () => {
    const adminExists = await User.findOne({ email: 'admin@zhi.edu.in' });
    if (!adminExists) {
        await User.create({ role: 'director', email: 'admin@zhi.edu.in', password: 'admin123' });
        console.log("👤 Admin seeded: admin@zhi.edu.in / admin123");
    }
};
seedAdmin();

// --- SELF-PING LOGIC (Anti-Sleep) ---
const keepAlive = () => {
    const SERVER_URL = 'https://zhi-college-rtya.onrender.com';
    https.get(SERVER_URL, (res) => {
        if (res.statusCode === 200) console.log('⏰ Server pinged successfully...');
    }).on('error', (err) => console.error('Ping fail:', err.message));
};
setInterval(keepAlive, 14 * 60 * 1000); 

// --- START SERVER ---
app.listen(PORT, () => console.log(`🚀 Server running perfectly on port ${PORT}`));
