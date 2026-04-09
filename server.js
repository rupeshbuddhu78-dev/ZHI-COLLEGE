const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- 2. CLOUDINARY CONFIGURATION ---
cloudinary.config({
    cloud_name: 'dzbpiv7ds',
    api_key: '812196161439545',
    api_secret: 'gWdxF2wJvGeuMqvpDgmNogS2pdY',
    secure: true
});

// Profile Photos ke liye storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiStudentProfiles',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    },
});
const upload = multer({ storage: storage });

// Global Notices (PDF/Images) ke liye storage
const noticeStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiNotices',
        resource_type: 'auto'
    },
});
const uploadNotice = multer({ storage: noticeStorage });

// 🔥 NAYA: Leave Documents ke liye Cloudinary Storage 🔥
const leaveStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiLeaves',
        resource_type: 'auto'
    },
});
const uploadLeave = multer({ storage: leaveStorage });

// Staff Files ke liye storage
const staffStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiStaffFiles',
        resource_type: 'auto',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx']
    },
});
const uploadStaff = multer({ storage: staffStorage });

// Study Notes ke liye storage
const noteStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiNotes',
        resource_type: 'auto'
    },
});
const uploadNote = multer({ storage: noteStorage });


// --- 3. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://rupeshdatabase:rupeshkumar9091@cluster0.2zu9ek1.mongodb.net/zhi_college?retryWrites=true&w=majority")
    .then(() => console.log("✅ Cloud MongoDB Connected Successfully! 🔥"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// --- 4. EMAIL SETUP ---
// --- NODEMAILER SECURE CONFIGURATION ---
// --- FINAL NODEMAILER CONFIGURATION ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,                   // 🔴 Port 465 hata kar 587 kar diya (Free servers pe ye block nahi hota)
    secure: false,               // 🔴 Port 587 ke liye isko false rakhna padta hai
    requireTLS: true,            // 🔴 Lekin connection secure rahega is line se
    auth: {
        user: '8651142739rupesh@gmail.com',  // Tera naya email
        pass: 'qkylmbcmxnuxiteb'             // Tera 16-digit password
    },
    tls: {
        rejectUnauthorized: false
    }
});

// --- 5. SCHEMAS & MODELS ---

const userSchema = new mongoose.Schema({
    role: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetOtp: String,
    otpExpiry: Date
});
const User = mongoose.model('User', userSchema);

const studentSchema = new mongoose.Schema({
    course: String, semester: String, sessionBatch: String,
    registrationDate: String, collegeRegNo: String, univRegNo: String,
    studentName: { type: String, required: true },
    dob: String, gender: String, bloodGroup: String,
    nationality: String, motherTongue: String,
    studentMobile: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    aadharNumber: String, category: String, religion: String,
    permanentAddress: String, city: String, state: String,
    pincode: String, district: String, tempAddress: String,
    fatherName: String, fatherMobile: String, motherName: String,
    motherMobile: String, guardianName: String, guardianRelation: String,
    guardianMobile: String, guardianAddress: String,
    amountCollected: Number, paymentMode: String, transactionId: String,
    password: { type: String, required: true },
    resetOtp: String,
    otpExpiry: Date,
    profilePicUrl: { type: String, default: "" }
}, { timestamps: true });
const Student = mongoose.model('Student', studentSchema);

// FINANCE SCHEMAS
const feeHeadSchema = new mongoose.Schema({
    headName: String, dueDate: String, amount: Number, discount: { type: Number, default: 0 },
    fine: { type: Number, default: 0 }, paid: { type: Number, default: 0 },
    due: Number, status: { type: String, default: "Due" }
});
const studentFeeSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    totalAmount: Number, totalDiscount: Number, totalPaid: Number, totalDue: Number,
    feeHeads: [feeHeadSchema]
});
const StudentFee = mongoose.model('StudentFee', studentFeeSchema);

const transactionSchema = new mongoose.Schema({
    receiptNo: { type: String, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    date: Date, mode: String, amount: Number, feeHeadName: String, remarks: String,
    payerMobile: String
}, { timestamps: true });
const Transaction = mongoose.model('Transaction', transactionSchema);

const expenseSchema = new mongoose.Schema({
    voucherNo: { type: String, unique: true }, category: String, date: Date,
    mode: String, amount: Number, description: String
}, { timestamps: true });
const Expense = mongoose.model('Expense', expenseSchema);

// NOTICE SCHEMA
const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, default: "info" },
    audience: [{ type: String }],
    fileUrl: { type: String, default: "" },
    postedBy: { type: String, default: "Director Office" }
}, { timestamps: true });
const Notice = mongoose.model('Notice', noticeSchema);

// STAFF SCHEMA
const staffSchema = new mongoose.Schema({
    category: { type: String, required: true },
    role: { type: String, required: true },
    empId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    fatherName: String, dob: String, gender: String,
    mobile: { type: String, required: true },
    email: { type: String }, address: String, contact: String,
    aadhaar: String, pan: String, qualification: String,
    university: String, experience: String, skills: String,
    joinDate: String, dept: String, shift: String,
    salary: Number, status: { type: String, default: "Active" },
    bankName: String, accNumber: String, ifsc: String,
    profilePicUrl: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    certUrl: { type: String, default: "" }
}, { timestamps: true });
const Staff = mongoose.model('Staff', staffSchema);

// ROUTINE SCHEMA
const routineSchema = new mongoose.Schema({
    course: { type: String, required: true },
    semester: { type: String, required: true },
    section: { type: String, required: true },
    subject: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    teacherName: { type: String, required: true },
    date: { type: String, required: true },
    dayOfWeek: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    roomNumber: { type: String }
}, { timestamps: true });
const Routine = mongoose.model('Routine', routineSchema);

// NOTES SCHEMA 
const noteSchema = new mongoose.Schema({
    date: { type: String, required: true },
    semester: { type: String, required: true },
    subject: { type: String, required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    teacherId: { type: String, required: true }  // 🔴 YE LINE NAYI ADD HUI HAI
}, { timestamps: true });
const Note = mongoose.model('Note', noteSchema);


// 🟢 TEACHER ATTENDANCE SCHEMA 🟢
const teacherAttendanceSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    teacherName: { type: String, required: true },
    dateStr: { type: String, required: true },
    monthVal: { type: String, required: true },
    dayName: { type: String },
    punchIn: { type: String, default: "" },
    punchOut: { type: String, default: "" },
    status: { type: String, default: "Present", enum: ["Present", "Absent", "Leave", "Half Day"] },
    remarks: { type: String, default: "On Time" }
}, { timestamps: true });

teacherAttendanceSchema.index({ teacherId: 1, dateStr: 1 }, { unique: true });
const TeacherAttendance = mongoose.model('TeacherAttendance', teacherAttendanceSchema);


// STUDENT ATTENDANCE SCHEMA
const attendanceSchema = new mongoose.Schema({
    fullDate: { type: Date, required: true },
    day: { type: Number, required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    batch: { type: String, required: true },
    course: { type: String, required: true },
    semester: { type: String, required: true },
    subject: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    records: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        rollNumber: { type: String, required: true },
        studentName: { type: String, required: true },
        status: { type: String, enum: ['P', 'A'], required: true }
    }],
    summary: {
        totalStudents: { type: Number, required: true },
        presentCount: { type: Number, required: true },
        absentCount: { type: Number, required: true },
        attendancePercentage: { type: Number, required: true }
    }
}, { timestamps: true });
attendanceSchema.index({ 'records.studentId': 1, subject: 1, fullDate: 1 });
attendanceSchema.index({ batch: 1, course: 1, semester: 1, fullDate: 1 });
const Attendance = mongoose.model('Attendance', attendanceSchema);

// 🔥 LEAVE SCHEMA (Isko Mark model ke niche paste karein) 🔥
const leaveSchema = new mongoose.Schema({
    applicantId: { type: String, required: true },
    applicantName: { type: String, required: true },
    applicantRole: { type: String, required: true },
    course: { type: String, default: "" },
    semester: { type: String, default: "" }, 
    leaveType: { type: String, default: "General" }, 
    startDate: { type: String, required: true }, 
    endDate: { type: String, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    documentUrl: { type: String, default: "" }, 
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    hodRemark: { type: String, default: "" }
}, { timestamps: true });

const Leave = mongoose.model('Leave', leaveSchema);

// 🟢 NEW: EXAM MARKS SCHEMA 🟢
const markSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    course: { type: String, required: true },
    sessionBatch: { type: String, required: true },
    semester: { type: String, required: true },
    subject: { type: String, required: true },
    examName: { type: String, required: true },
    examDate: { type: Date, required: true },
    maxMarks: { type: Number, required: true },
    studentsMarkList: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        rollNo: { type: String, required: true },
        studentName: { type: String, required: true },
        attendanceStatus: { type: String, enum: ['Present', 'Absent', 'Debarred'], default: 'Present' },
        marksObtained: { type: Number, default: 0 },
        rank: { type: Number, default: 0 },
        remarks: { type: String, default: "" }
    }],
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published' }
}, { timestamps: true });

markSchema.index({ course: 1, sessionBatch: 1, semester: 1, subject: 1, examName: 1 }, { unique: true });
const Mark = mongoose.model('Mark', markSchema);


// FEE GENERATOR HELPER FUNCTION
const generateFeeStructure = (courseName) => {
    let baseTuition = (courseName && courseName.toLowerCase() === 'mca') ? 25000 : 16880;
    let heads = [
        { headName: "Admission Fee (Non Refundable)", amount: 30000, dueDate: "01-08-2025" },
        { headName: "University Reg. Fees", amount: 2100, dueDate: "30-08-2025" },
        { headName: "1st Sem Tuition Fees - 1st Installment", amount: 12130, dueDate: "30-08-2025" },
        { headName: "1st Sem Tuition Fees - 2nd Installment", amount: 10530, dueDate: "30-11-2025" },
        { headName: "Examination Fees (Sem 1)", amount: 3700, dueDate: "30-11-2025" },
        { headName: "2nd Sem Tuition Fees - 1st Installment", amount: baseTuition, dueDate: "15-02-2026" },
        { headName: "2nd Sem Tuition Fees - 2nd Installment", amount: baseTuition, dueDate: "20-05-2026" },
        { headName: "Examination Fees (Sem 2)", amount: 3700, dueDate: "20-05-2026" },
        { headName: "3rd Sem Tuition Fees - 1st Installment", amount: baseTuition, dueDate: "01-09-2026" },
        { headName: "3rd Sem Tuition Fees - 2nd Installment", amount: baseTuition, dueDate: "01-12-2026" },
        { headName: "Examination Fees (Sem 3)", amount: 3700, dueDate: "01-12-2026" },
        { headName: "4th Sem Tuition Fees - 1st Installment", amount: baseTuition, dueDate: "15-02-2027" },
        { headName: "4th Sem Tuition Fees - 2nd Installment", amount: baseTuition, dueDate: "20-05-2027" },
        { headName: "Examination Fees (Sem 4)", amount: 3700, dueDate: "20-05-2027" },
        { headName: "5th Sem Tuition Fees - 1st Installment", amount: baseTuition, dueDate: "01-09-2027" },
        { headName: "5th Sem Tuition Fees - 2nd Installment", amount: baseTuition, dueDate: "01-12-2027" },
        { headName: "Examination Fees (Sem 5)", amount: 3700, dueDate: "01-12-2027" },
        { headName: "6th Sem Tuition Fees - 1st Installment", amount: baseTuition, dueDate: "15-02-2028" },
        { headName: "Provisional Certificate Fees", amount: 500, dueDate: "20-05-2028" },
        { headName: "6th Sem Tuition Fees - 2nd Installment", amount: baseTuition, dueDate: "20-05-2028" },
        { headName: "Examination Fees (Sem 6)", amount: 3700, dueDate: "20-05-2028" }
    ];
    let processedHeads = heads.map(h => ({ ...h, discount: 0, fine: 0, paid: 0, due: h.amount, status: "Due" }));
    let total = processedHeads.reduce((sum, h) => sum + h.amount, 0);
    return { feeHeads: processedHeads, totalAmount: total, totalDue: total, totalPaid: 0, totalDiscount: 0 };
};

// --- 6. API ROUTES ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ------------------------------------------
// Login API 
// ------------------------------------------
app.post('/api/login', async (req, res) => {
    const { role, email, password } = req.body;
    try {
        if (role.toLowerCase() === 'student') {
            const student = await Student.findOne({ email, password });
            if (student) {
                return res.status(200).json({
                    success: true,
                    message: "Welcome Student!",
                    role: "Student",
                    studentId: student._id,
                    studentName: student.studentName,
                    course: student.course || "N/A",
                    semester: student.semester || "N/A",
                    email: student.email,
                    registrationNo: student.collegeRegNo || "N/A",
                    regDate: student.registrationDate || "N/A",
                    dob: student.dob || "N/A",
                    gender: student.gender || "N/A",
                    bloodGroup: (student.bloodGroup && student.bloodGroup.trim() !== "") ? student.bloodGroup : "N/A",
                    category: student.category || "N/A",
                    religion: student.religion || "N/A",
                    profilePicUrl: student.profilePicUrl || ""
                });
            }
        }

        else if (role.toLowerCase() === 'director') {
            const user = await User.findOne({ email, password, role: 'director' });
            if (user) {
                return res.status(200).json({ success: true, message: "Welcome Admin!", role: user.role });
            }
        }

        else if (['hod', 'accountant', 'staff', 'teacher'].includes(role.toLowerCase())) {
            let dbCategory = 'management';
            if (role.toLowerCase() === 'teacher') {
                dbCategory = 'teacher';
            }

            const staffUser = await Staff.findOne({ email, password, category: dbCategory });
            if (staffUser) {
                if (staffUser.status === 'Disabled') {
                    return res.status(403).json({ success: false, message: "Your account is disabled. Please contact Director." });
                }

                return res.status(200).json({
                    success: true,
                    message: "Welcome " + staffUser.name,
                    role: role,
                    staffId: staffUser._id,
                    staffName: staffUser.name
                });
            }
        }

        res.status(401).json({ success: false, message: "Invalid Email or Password!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error!" });
    }
});

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
                    remainingAmount -= head.due;
                    head.paid = head.due;
                    head.due = 0;
                    head.status = "Paid";
                } else {
                    head.paid = remainingAmount;
                    head.due -= remainingAmount;
                    head.status = "Partial";
                    remainingAmount = 0;
                }
            }

            const newTxn = new Transaction({
                receiptNo: "REC" + Date.now() + Math.floor(Math.random() * 100),
                studentId: savedStudent._id,
                date: new Date(),
                mode: req.body.paymentMode || "Cash",
                amount: collected,
                feeHeadName: "Admission Fee (Auto Distributed)",
                remarks: req.body.transactionId || "Admission Time Payment",
                payerMobile: req.body.studentMobile || req.body.fatherMobile
            });
            await newTxn.save();
        }

        const studentFee = new StudentFee({
            studentId: savedStudent._id,
            totalAmount: feeData.totalAmount,
            totalDiscount: feeData.totalDiscount,
            totalPaid: feeData.totalPaid,
            totalDue: feeData.totalDue,
            feeHeads: feeData.feeHeads
        });
        await studentFee.save();

        res.status(201).json({ success: true, message: 'Student & Fee Record added successfully!', studentId: savedStudent._id });

    } catch (error) {
        console.error(error);
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Email already exists!' });
        res.status(500).json({ success: false, message: 'Server error!' });
    }
});

app.post('/api/upload-photo/:id', upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded!' });
        const photoUrl = req.file.path;
        const student = await Student.findByIdAndUpdate(req.params.id, { profilePicUrl: photoUrl }, { new: true });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found!' });
        res.status(200).json({ success: true, message: 'Photo Updated!', profilePicUrl: photoUrl });
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

// ==========================================
// 1. FORGOT PASSWORD API (Supports App & Web)
// ==========================================
app.post('/api/forgot-password', async (req, res) => {
    let { email } = req.body;
    // 2. Tumhara Google Script URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlYFfak-GF51cTGRspEwU6S1fKP2a3wvyn4uEdNfkmvjJHSxk5_ir7ilFBvXzulE4xMA/exec';

    console.log("👉 [DEBUG] Request aayi! Email:", email);

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required!" });
    }

    try {
        const emailRegex = new RegExp('^' + email.trim() + '$', 'i');

        // Sabhi models mein dhoondhega (Teacher included)
        let user = await Student.findOne({ email: emailRegex }) 
                || await User.findOne({ email: emailRegex }) 
                || await Staff.findOne({ email: emailRegex })
                || await Teacher.findOne({ email: emailRegex });

        if (!user) {
            console.log("❌ [DEBUG] Email DB mein nahi mila!");
            return res.status(404).json({ success: false, message: "Email not found!" });
        }

        // OTP Generate
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; 
        await user.save();

        // 3. GOOGLE SCRIPT KO DATA BHEJO (RESEND KI JAGAH)
        await axios.post(GOOGLE_SCRIPT_URL, {
            to: user.email,
            subject: 'ZHI College - Password Reset OTP',
            body: `Hello ${user.name || 'User'},\n\nAapka Password Reset OTP hai: ${otp}\n\nYeh 10 mins tak valid hai. Kripya ise share na karein.`
        });

        console.log("✅ [SUCCESS] Google Script ne OTP bhej diya!");
        res.status(200).json({ success: true, message: "OTP sent successfully!" });

    } catch (err) {
        console.error("❌ [ERROR]:", err.message);
        res.status(500).json({ success: false, message: "Internal server error!" });
    }
});

// --- UPDATED RESET PASSWORD API (TEACHER INCLUDED) ---
app.post('/api/reset-password', async (req, res) => {
    let { email, otp, newPassword } = req.body;

    try {
        const emailRegex = new RegExp('^' + email.trim() + '$', 'i');

        let user = await Student.findOne({ email: emailRegex }) 
                || await User.findOne({ email: emailRegex }) 
                || await Staff.findOne({ email: emailRegex })
                || await Teacher.findOne({ email: emailRegex });

        if (!user || user.resetOtp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or Expired OTP!" });
        }

        user.password = newPassword;
        user.resetOtp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (err) { 
        res.status(500).json({ success: false, message: "Server error!" }); 
    }
});
// FINANCE API ROUTES
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
    } catch (err) {
        res.status(500).json({ success: false, message: "Error searching students" });
    }
});

app.get('/api/finance/student-fee/:studentId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) return res.status(404).json({ success: false, message: "Student not found!" });

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
        if (!feeRecord) return res.status(404).json({ success: false, message: "Ledger not found!" });

        const headIndex = feeRecord.feeHeads.findIndex(h => h._id.toString() === headId);
        if (headIndex === -1) return res.status(400).json({ success: false, message: "Fee head not found!" });

        feeRecord.feeHeads[headIndex].paid += Number(amount);
        feeRecord.feeHeads[headIndex].due -= Number(amount);
        if (feeRecord.feeHeads[headIndex].due <= 0) feeRecord.feeHeads[headIndex].status = "Paid";

        feeRecord.totalPaid += Number(amount);
        feeRecord.totalDue -= Number(amount);
        await feeRecord.save();

        const receiptNo = "REC" + Math.floor(100000 + Math.random() * 900000);
        const newTrans = new Transaction({
            receiptNo, studentId, amount, mode, date: date || new Date(),
            feeHeadName: feeRecord.feeHeads[headIndex].headName, remarks,
            payerMobile
        });
        await newTrans.save();

        res.status(200).json({ success: true, message: "Fee Collected Successfully!", receipt: newTrans });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/finance/dashboard', async (req, res) => {
    try {
        const transactions = await Transaction.find().populate('studentId', 'studentName collegeRegNo course').sort({ createdAt: -1 }).limit(20);
        const expenses = await Expense.find().sort({ createdAt: -1 }).limit(20);

        const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

        const allFees = await StudentFee.find();
        const totalDue = allFees.reduce((sum, f) => sum + f.totalDue, 0);

        res.status(200).json({
            success: true,
            stats: { income: totalIncome, expense: totalExpense, due: totalDue, balance: totalIncome - totalExpense },
            transactions, expenses
        });
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

// ==========================================
// 🟢 GLOBAL NOTICE APIs 🟢
// ==========================================
app.post('/api/notices', uploadNotice.single('attachment'), async (req, res) => {
    try {
        // 🔥 Yahan postedBy add kiya hai
        const { title, message, priority, audience, postedBy } = req.body;

        let fileUrl = "";
        if (req.file) {
            let tempUrl = req.file.secure_url || req.file.path;
            fileUrl = tempUrl.replace(/\.pdf$/i, '.png');
        }

        let parsedAudience = [];
        try { parsedAudience = JSON.parse(audience); }
        catch (e) { parsedAudience = audience ? audience.split(',') : []; }

        const newNotice = new Notice({
            title,
            message,
            priority,
            audience: parsedAudience,
            fileUrl,
            postedBy: postedBy || "Director Office" // 🔥 Aur yahan save ho raha hai
        });

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
        // 🔥 Yahan postedBy add kiya hai
        const { title, message, priority, audience, postedBy } = req.body;
        let updateData = { title, message, priority };

        // 🔥 Agar edit karte time naya naam bheja to update hoga
        if (postedBy) updateData.postedBy = postedBy;

        if (audience) {
            try { updateData.audience = JSON.parse(audience); }
            catch (e) { updateData.audience = audience.split(','); }
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

// STAFF (USERS & ROLES) APIs
app.post('/api/staff', uploadStaff.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'resumeFile', maxCount: 1 },
    { name: 'certFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const staffData = req.body;

        const existingStaff = await Staff.findOne({ empId: staffData.empId });
        if (existingStaff) return res.status(400).json({ success: false, message: "Employee ID already exists!" });

        if (req.files) {
            if (req.files['profilePic']) {
                let tempUrl = req.files['profilePic'][0].secure_url || req.files['profilePic'][0].path;
                staffData.profilePicUrl = tempUrl.replace(/\.pdf$/i, '.png');
            }
            if (req.files['resumeFile']) {
                let tempUrl = req.files['resumeFile'][0].secure_url || req.files['resumeFile'][0].path;
                staffData.resumeUrl = tempUrl.replace(/\.pdf$/i, '.png');
            }
            if (req.files['certFile']) {
                let tempUrl = req.files['certFile'][0].secure_url || req.files['certFile'][0].path;
                staffData.certUrl = tempUrl.replace(/\.pdf$/i, '.png');
            }
        }

        const newStaff = new Staff(staffData);
        await newStaff.save();

        res.status(201).json({ success: true, message: "Staff Added Successfully!", data: newStaff });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/staff', async (req, res) => {
    try {
        const staffList = await Staff.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: staffList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/staff/:id', uploadStaff.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'resumeFile', maxCount: 1 },
    { name: 'certFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const updateData = req.body;

        if (req.files) {
            if (req.files['profilePic']) {
                let tempUrl = req.files['profilePic'][0].secure_url || req.files['profilePic'][0].path;
                updateData.profilePicUrl = tempUrl.replace(/\.pdf$/i, '.png');
            }
            if (req.files['resumeFile']) {
                let tempUrl = req.files['resumeFile'][0].secure_url || req.files['resumeFile'][0].path;
                updateData.resumeUrl = tempUrl.replace(/\.pdf$/i, '.png');
            }
            if (req.files['certFile']) {
                let tempUrl = req.files['certFile'][0].secure_url || req.files['certFile'][0].path;
                updateData.certUrl = tempUrl.replace(/\.pdf$/i, '.png');
            }
        }

        const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedStaff) return res.status(404).json({ success: false, message: "Staff not found!" });
        res.status(200).json({ success: true, message: "Staff Details Updated!", data: updatedStaff });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/staff/:id', async (req, res) => {
    try {
        const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
        if (!deletedStaff) return res.status(404).json({ success: false, message: "Staff not found!" });

        res.status(200).json({ success: true, message: "Staff Data Deleted!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// NOTES (STUDY MATERIAL) APIs

// 3. GET STUDENT MARKS (FOR HOD PANEL)
app.get('/api/marks', async (req, res) => {
    try {
        const { course, sessionBatch, semester } = req.query;

        // Validation check
        if (!course || !sessionBatch || !semester) {
            return res.status(400).json({ 
                success: false, 
                message: "Course, Batch, and Semester parameters are required!" 
            });
        }

        // Database se marks nikalna aur Teacher ka naam (populate) sath lana
        const marksRecords = await Mark.find({ 
            course: course, 
            sessionBatch: sessionBatch, 
            semester: semester 
        })
        .populate('teacherId', 'name') 
        .sort({ examDate: -1, createdAt: -1 });

        // Data frontend ko bhejna
        res.status(200).json({ 
            success: true, 
            data: marksRecords || [] 
        });

    } catch (error) {
        console.error("❌ Marks Fetch Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// 1. POST API (Note Upload)
app.post('/api/notes', uploadNote.single('file'), async (req, res) => {
    try {
        // 🔴 Yahan req.body se 'teacherId' ko bhi nikalna hai
        const { date, semester, subject, title, teacherId } = req.body;
        let fileUrl = "";
        let cloudinaryId = "";

        if (req.file) {
            let tempUrl = req.file.secure_url || req.file.path;
            fileUrl = tempUrl.replace(/\.pdf$/i, '.png');
            cloudinaryId = req.file.filename;
        } else {
            return res.status(400).json({ success: false, message: "No file provided!" });
        }

        // 🔴 Yahan new Note banate time 'teacherId' ko DB me save karwana hai
        const newNote = new Note({ date, semester, subject, title, fileUrl, cloudinaryId, teacherId });
        await newNote.save();

        res.status(201).json({ success: true, message: "Study Material uploaded successfully!", data: newNote });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. GET API (Fetch Notes)
app.get('/api/notes', async (req, res) => {
    try {
        // 🔴 Yahan query se 'teacherId' ko bhi fetch karna hai
        const { semester, subject, teacherId } = req.query;
        let filter = {};

        if (semester) filter.semester = new RegExp(`^${semester}$`, 'i');
        if (subject) filter.subject = new RegExp(`^${subject}$`, 'i');
        
        // 🔴 Agar URL mein teacherId aaya hai, toh filter lagao (Sirf us teacher ke notes)
        if (teacherId) filter.teacherId = teacherId;

        const notes = await Note.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. DELETE API (Delete Notes - isme koi change nahi)
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ success: false, message: "Note not found!" });

        if (note.cloudinaryId) {
            await cloudinary.uploader.destroy(note.cloudinaryId);
        }

        await Note.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Note deleted permanently!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ROUTINE (TIMETABLE) APIs 
app.post('/api/routines', async (req, res) => {
    try {
        const newRoutine = new Routine(req.body);
        await newRoutine.save();
        res.status(201).json({ success: true, message: "Routine added successfully!", data: newRoutine });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/routines', async (req, res) => {
    try {
        const { course, semester, teacherId, dayOfWeek } = req.query;
        let filter = {};

        if (course) filter.course = new RegExp(`^${course}$`, 'i');
        if (semester) filter.semester = semester;
        if (teacherId) filter.teacherId = teacherId;
        if (dayOfWeek) filter.dayOfWeek = new RegExp(`^${dayOfWeek}$`, 'i');

        const routines = await Routine.find(filter)
            .populate('teacherId', 'name empId')
            .sort({ dayOfWeek: 1, startTime: 1 });

        res.status(200).json({ success: true, data: routines });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/routines/:id', async (req, res) => {
    try {
        const updatedRoutine = await Routine.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRoutine) return res.status(404).json({ success: false, message: "Routine not found!" });
        res.status(200).json({ success: true, message: "Routine updated successfully!", data: updatedRoutine });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/routines/:id', async (req, res) => {
    try {
        const deletedRoutine = await Routine.findByIdAndDelete(req.params.id);
        if (!deletedRoutine) return res.status(404).json({ success: false, message: "Routine not found!" });
        res.status(200).json({ success: true, message: "Routine deleted permanently!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 🟢 TEACHER SELF-ATTENDANCE APIs 🟢
// ==========================================

// 1. Mark Punch In / Out
app.post('/api/teacher-attendance/punch', async (req, res) => {
    try {
        const { teacherId, teacherName, action, timeStr, dateStr, monthVal, dayName } = req.body;

        if (action === 'IN') {
            const newLog = await TeacherAttendance.findOneAndUpdate(
                { teacherId, dateStr },
                {
                    teacherId,
                    teacherName,
                    dateStr,
                    monthVal,
                    dayName,
                    punchIn: timeStr,
                    status: 'Present',
                    remarks: 'On Time'
                },
                { new: true, upsert: true }
            );
            res.status(200).json({ success: true, message: "Punched In Successfully", data: newLog });
        }
        else if (action === 'OUT') {
            const updatedLog = await TeacherAttendance.findOneAndUpdate(
                { teacherId, dateStr },
                { punchOut: timeStr, remarks: 'Shift Completed' },
                { new: true }
            );
            if (!updatedLog) {
                return res.status(400).json({ success: false, message: "Cannot punch out without punching in first!" });
            }
            res.status(200).json({ success: true, message: "Punched Out Successfully", data: updatedLog });
        }
        else {
            res.status(400).json({ success: false, message: "Invalid action type" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Get specific Teacher's Attendance (For Teacher's Own Dashboard)
app.get('/api/teacher-attendance/:teacherId', async (req, res) => {
    try {
        const logs = await TeacherAttendance.find({ teacherId: req.params.teacherId }).sort({ dateStr: 1 });
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Get ALL Teachers Attendance (For HOD/Admin Dashboard view)
app.get('/api/teacher-attendance', async (req, res) => {
    try {
        const { dateStr, monthVal } = req.query;
        let filter = {};

        if (dateStr) filter.dateStr = dateStr;
        if (monthVal) filter.monthVal = monthVal;

        const logs = await TeacherAttendance.find(filter).populate('teacherId', 'name empId dept').sort({ dateStr: -1 });
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 🟢 STUDENT ATTENDANCE APIs 🟢
// ==========================================

app.get('/api/get-courses', async (req, res) => {
    try {
        const courses = await Student.distinct('course');
        res.status(200).json({ success: true, courses: courses.filter(Boolean) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/get-batches', async (req, res) => {
    try {
        const { course } = req.query;
        const batches = await Student.distinct('sessionBatch', { course: new RegExp(`^${course}$`, 'i') });
        res.status(200).json({ success: true, batches: batches.filter(Boolean) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/get-teacher-skills', async (req, res) => {
    try {
        const { staffId } = req.query;
        if (!staffId) return res.status(400).json({ success: false, message: "Staff ID required" });

        const teacher = await Staff.findById(staffId);
        if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

        let skillsArray = [];
        if (teacher.skills) {
            skillsArray = teacher.skills.split(',').map(s => s.trim());
        }
        res.status(200).json({ success: true, skills: skillsArray });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/get-students', async (req, res) => {
    try {
        // FIXED: Added sessionBatch destructuring so that the exact batch can be loaded
        const { course, batch, sessionBatch, semester, date, isEdit, subject } = req.query;

        let queryFilter = {
            course: new RegExp(`^${course}$`, 'i'),
            semester: semester
        };

        // Dono fields se kaam kar le
        const actualBatch = sessionBatch || batch;
        if (actualBatch) {
            queryFilter.sessionBatch = actualBatch;
        }

        const students = await Student.find(queryFilter).select('_id studentName collegeRegNo');

        if (!students || students.length === 0) {
            return res.status(200).json({ success: true, students: [] });
        }

        let studentsData = students.map(s => ({
            _id: s._id,
            roll: s.collegeRegNo || 'N/A',
            name: s.studentName,
            prevAtt: 100
        }));

        if (isEdit === 'true') {
            const existingAtt = await Attendance.findOne({
                course: course,
                semester: semester,
                subject: subject,
                fullDate: new Date(date)
            });

            if (existingAtt) {
                studentsData = studentsData.map(s => {
                    const record = existingAtt.records.find(r => r.studentId.toString() === s._id.toString());
                    return {
                        ...s,
                        recordedStatus: record ? record.status : 'A'
                    };
                });
            }
        }

        res.status(200).json({ success: true, students: studentsData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/attendances/subject', async (req, res) => {
    try {
        const { course, semester, subject } = req.query;

        let filter = {};
        if (course) filter.course = new RegExp(`^${course}$`, 'i');
        if (semester) filter.semester = semester;
        if (subject) filter.subject = new RegExp(`^${subject}$`, 'i');

        const records = await Attendance.find(filter);
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/save-attendance', async (req, res) => {
    try {
        const payload = req.body;

        if (payload.mode === 'UPDATE') {
            const updated = await Attendance.findOneAndUpdate(
                {
                    fullDate: new Date(payload.fullDate),
                    course: payload.course,
                    semester: payload.semester,
                    subject: payload.subject
                },
                payload,
                { new: true, upsert: true }
            );
            return res.status(200).json({ success: true, message: "Attendance updated!", data: updated });
        } else {
            const existing = await Attendance.findOne({
                fullDate: new Date(payload.fullDate),
                course: payload.course,
                semester: payload.semester,
                subject: payload.subject
            });

            if (existing) {
                return res.status(400).json({ success: false, message: "Attendance already exists for this Date & Subject. Use 'Edit Existing' button." });
            }

            const newAttendance = new Attendance(payload);
            await newAttendance.save();
            res.status(201).json({ success: true, message: "Attendance saved!", data: newAttendance });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/attendance', async (req, res) => {
    try {
        const { studentId } = req.query;

        if (!studentId) {
            return res.status(400).json({ success: false, message: "Student ID is required" });
        }

        let attendanceData = await Attendance.find({ 'records.studentId': studentId })
            .populate('teacherId', 'name')
            .sort({ fullDate: -1 });

        const formattedData = attendanceData.map(record => {
            const studentRecord = record.records.find(r => r.studentId.toString() === studentId);
            return {
                _id: record._id,
                course: record.course,
                semester: record.semester,
                subject: record.subject,
                date: record.fullDate,
                teacher: record.teacherId ? record.teacherId.name : "N/A",
                studentStatus: studentRecord ? studentRecord.status : "A"
            };
        });

        res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 🟢 MARKS APIs (UPLOAD & FETCH) 🟢
// ==========================================

// 1. Upload or Update Marks
app.post('/api/marks/upload', async (req, res) => {
    try {
        const payload = req.body;

        // Pata lagao ki same exam aur same subject ka marks pehle se upload hai ya nahi
        const existingExam = await Mark.findOne({
            course: payload.course,
            sessionBatch: payload.sessionBatch,
            semester: payload.semester,
            subject: payload.subject,
            examName: new RegExp(`^${payload.examName}$`, 'i')
        });

        if (existingExam) {
            // Agar existing hai toh overwrite (Edit) kardo
            const updated = await Mark.findByIdAndUpdate(existingExam._id, payload, { new: true });
            return res.status(200).json({ success: true, message: "Marks updated successfully!", data: updated });
        } else {
            // Nahi toh naya upload create karo
            const newMarks = new Mark(payload);
            await newMarks.save();
            return res.status(201).json({ success: true, message: "Marks & Ranks saved successfully!", data: newMarks });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Check if Marks Exist (For Edit Mode in Frontend)
app.get('/api/marks/check', async (req, res) => {
    try {
        const { course, sessionBatch, semester, subject, examName } = req.query;
        const examRecord = await Mark.findOne({
            course: new RegExp(`^${course}$`, 'i'),
            sessionBatch: sessionBatch,
            semester: semester,
            subject: subject,
            examName: new RegExp(`^${examName}$`, 'i')
        });

        if (examRecord) {
            res.status(200).json({ success: true, exists: true, data: examRecord });
        } else {
            res.status(200).json({ success: true, exists: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Fetch Student's Marks for Android App (With Rank & Subject)
app.get('/api/marks/student', async (req, res) => {
    try {
        const { studentId } = req.query;
        if (!studentId) return res.status(400).json({ success: false, message: "Student ID is required" });

        // Database me wo sabhi exams dhundho jismein is bache ka studentId ho
        const allExams = await Mark.find({ 'studentsMarkList.studentId': studentId })
            .populate('teacherId', 'name')
            .sort({ examDate: -1 });

        // App ko bhejne ke liye format karo (taki app result screen me theek se dikhe)
        const formattedMarks = allExams.map(exam => {
            const studentRecord = exam.studentsMarkList.find(s => s.studentId.toString() === studentId.toString());
            return {
                _id: exam._id,
                examName: exam.examName,
                subject: exam.subject,
                course: exam.course,
                semester: exam.semester,
                date: exam.examDate,
                teacher: exam.teacherId ? exam.teacherId.name : "Faculty",
                maxMarks: exam.maxMarks,
                attendanceStatus: studentRecord.attendanceStatus,
                marksObtained: studentRecord.marksObtained,
                rank: studentRecord.rank,
                remarks: studentRecord.remarks
            };
        });

        res.status(200).json({ success: true, data: formattedMarks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 🟢 LEAVE MANAGEMENT APIs 🟢
// ==========================================

// 1. Get all leaves (HOD ya Admin ko dikhane ke liye)
app.get('/api/leaves', async (req, res) => {
    try {
        const leaves = await Leave.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Apply for Leave (Student / Teacher dono ke liye common route)
app.post('/api/leaves/apply', uploadLeave.single('document'), async (req, res) => {
    try {
        // ✅ FIX: course aur semester ko req.body se nikal liya gaya hai
        const { applicantId, applicantName, applicantRole, course, semester, leaveType, startDate, endDate, totalDays, reason } = req.body;

        let documentUrl = "";
        if (req.file) {
            // 🔥 Cloudinary PDF URL ko PNG me badalna taaki direct image dikhe
            let tempUrl = req.file.secure_url || req.file.path;
            documentUrl = tempUrl.replace(/\.pdf$/i, '.png');
        }

        const newLeave = new Leave({
            applicantId,
            applicantName,
            applicantRole,
            leaveType,
            course: course || "", 
            semester: semester || "",
            startDate,
            endDate,
            totalDays: Number(totalDays),
            reason,
            documentUrl
        });

        await newLeave.save();
        res.status(201).json({ success: true, message: "Leave application submitted successfully!", data: newLeave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Approve/Reject Leave (For HOD Panel)
app.post('/api/leaves/update-status', async (req, res) => {
    try {
        const { id, status, remark } = req.body;
        const updatedLeave = await Leave.findByIdAndUpdate(
            id,
            { status: status, hodRemark: remark },
            { new: true }
        );

        if (!updatedLeave) return res.status(404).json({ success: false, message: "Leave record not found!" });

        res.status(200).json({ success: true, message: `Leave ${status} successfully!`, data: updatedLeave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- 7. SEED ADMIN ---
const seedAdmin = async () => {
    const adminExists = await User.findOne({ email: 'admin@zhi.edu.in' });
    if (!adminExists) {
        await User.create({
            role: 'director',
            email: 'admin@zhi.edu.in',
            password: 'admin123'
        });
        console.log("👤 Admin seeded: admin@zhi.edu.in / admin123");
    }
};
seedAdmin();

// --- 8. SELF-PING LOGIC (Anti-Sleep) ---
const keepAlive = () => {
    const SERVER_URL = 'https://zhi-college-rtya.onrender.com';
    https.get(SERVER_URL, (res) => {
        if (res.statusCode === 200) {
            console.log('⏰ Server khud ko ping kar raha hai taaki soye nahi! (Status: 200)');
        }
    }).on('error', (err) => {
        console.log('❌ Ping fail ho gaya:', err.message);
    });
};

setInterval(keepAlive, 5 * 60 * 1000);

// --- 9. START SERVER ---
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
