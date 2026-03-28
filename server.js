const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer'); 
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
    api_secret: 'gWdxF2wJvGeuMqvpDgmNogS2pdY' 
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

// 🔴 NEW: Global Notices (PDF/Images) ke liye storage 🔴
const noticeStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiNotices', 
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'], 
        resource_type: 'auto'
    },
});
const uploadNotice = multer({ storage: noticeStorage });

// --- 3. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://rupeshdatabase:rupeshkumar9091@cluster0.2zu9ek1.mongodb.net/zhi_college?retryWrites=true&w=majority")
.then(() => console.log("✅ Cloud MongoDB Connected Successfully! 🔥"))
.catch((err) => console.log("❌ MongoDB Connection Error:", err));

// --- 4. EMAIL SETUP ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'rupesh.c.0828@zhi.org.in', 
        pass: 'dyju pxba misf qfuk' 
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log("❌ Email Setup Error:", error);
    } else {
        console.log("✅ Email Server Ready hai! OTP ja sakta hai.");
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

// 🟢 FINANCE SCHEMAS (Advanced Array Logic) 🟢
const feeHeadSchema = new mongoose.Schema({
    headName: String, dueDate: String, amount: Number, discount: { type: Number, default: 0 }, 
    fine: { type: Number, default: 0 }, paid: { type: Number, default: 0 }, 
    due: Number, status: { type: String, default: "Due" }
});

const studentFeeSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    totalAmount: Number, totalDiscount: Number, totalPaid: Number, totalDue: Number,
    feeHeads: [feeHeadSchema] // 🔴 6 Semesters ka list yahan aayega
});
const StudentFee = mongoose.model('StudentFee', studentFeeSchema);

const transactionSchema = new mongoose.Schema({
    receiptNo: { type: String, unique: true }, 
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    date: Date, mode: String, amount: Number, feeHeadName: String, remarks: String,
    payerMobile: String // 🔴 ADDED: Payer Mobile Number
}, { timestamps: true });
const Transaction = mongoose.model('Transaction', transactionSchema);

const expenseSchema = new mongoose.Schema({
    voucherNo: { type: String, unique: true }, category: String, date: Date, 
    mode: String, amount: Number, description: String
}, { timestamps: true });
const Expense = mongoose.model('Expense', expenseSchema);

// 🟢 NEW: NOTICE SCHEMA 🟢
const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, default: "info" }, // 'info' ya 'urgent'
    audience: [{ type: String }], // Array ["Students", "Faculty", "Staff"]
    fileUrl: { type: String, default: "" }, // PDF/Image URL from Cloudinary
    postedBy: { type: String, default: "Director Office" }
}, { timestamps: true });
const Notice = mongoose.model('Notice', noticeSchema);

// 🟢 FEE GENERATOR HELPER FUNCTION 🟢
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

// Login API
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
        } else {
            const user = await User.findOne({ email, role, password });
            if (user) {
                return res.status(200).json({ success: true, message: "Welcome Admin!", role: user.role });
            }
        }
        res.status(401).json({ success: false, message: "Invalid Credentials!" });
    } catch (err) { res.status(500).json({ success: false, message: "Server Error!" }); }
});

// Admin & Student Core APIs
app.post('/api/add-student', async (req, res) => {
    try {
        const newStudent = new Student({
            ...req.body,
            password: req.body.studentMobile // Default password is mobile number
        });
        const savedStudent = await newStudent.save();
        res.status(201).json({ 
            success: true, message: 'Student added successfully!', studentId: savedStudent._id 
        });
    } catch (error) {
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

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        let user = await Student.findOne({ email }) || await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "Email not found!" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; 
        await user.save();

        await transporter.sendMail({
            from: 'rupesh.c.0828@zhi.org.in',
            to: user.email,
            subject: 'ZHI App - OTP',
            text: `Aapka Password Reset OTP hai: ${otp}. Yeh 10 mins tak valid hai.`
        });

        res.status(200).json({ success: true, message: "OTP sent to your email!" });
    } catch (err) {
        console.log("❌ OTP Bhejney mein error aya:", err);
        res.status(500).json({ success: false, message: "Error sending email!" });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        let user = await Student.findOne({ email }) || await User.findOne({ email });
        if (!user || user.resetOtp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or Expired OTP!" });
        }
        user.password = newPassword;
        user.resetOtp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (err) { res.status(500).json({ success: false, message: "Server error!" }); }
});


// 🟢 FINANCE API ROUTES 🟢

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

        // Update amounts
        feeRecord.feeHeads[headIndex].paid += Number(amount);
        feeRecord.feeHeads[headIndex].due -= Number(amount);
        if(feeRecord.feeHeads[headIndex].due <= 0) feeRecord.feeHeads[headIndex].status = "Paid";

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
        const transactions = await Transaction.find().populate('studentId', 'studentName collegeRegNo course').sort({createdAt: -1}).limit(20);
        const expenses = await Expense.find().sort({createdAt: -1}).limit(20);
        
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

// 🟢 NEW: GLOBAL NOTICE APIs 🟢

// 1. Upload Notice
app.post('/api/notices', uploadNotice.single('attachment'), async (req, res) => {
    try {
        const { title, message, priority, audience } = req.body;
        
        let fileUrl = "";
        if (req.file) {
            fileUrl = req.file.path; // Cloudinary ka direct link aayega
        }

        // Frontend se string aayega, usko array mein convert karna hai
        let parsedAudience = [];
        try {
            parsedAudience = JSON.parse(audience);
        } catch (e) {
            parsedAudience = audience ? audience.split(',') : [];
        }

        const newNotice = new Notice({
            title, message, priority, audience: parsedAudience, fileUrl
        });

        await newNotice.save();
        res.status(201).json({ success: true, message: "Notice sent successfully!", data: newNotice });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Fetch Notices (App aur Admin dono ke liye)
app.get('/api/notices', async (req, res) => {
    try {
        const { targetRole } = req.query; // 'Students', 'Faculty', etc.
        let filter = {};
        
        if (targetRole) {
            filter.audience = targetRole; 
        }

        const notices = await Notice.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notices });
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
    const SERVER_URL = 'https://zhi-college.onrender.com'; 
    
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
