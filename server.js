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
    api_secret: 'gWdxF2wJvGeuMqvpDgmNogS2pdY',
    secure: true // 🔴 ADDED: Isse browser mein link block nahi hoga
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

// 🟢 NEW: Staff (Management/Teacher/Non-Teaching) Files ke liye storage 🟢
const staffStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiStaffFiles', 
        resource_type: 'auto', // Auto taaki PDF (Resume) aur JPG (Profile) dono support kare
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx']
    },
});
const uploadStaff = multer({ storage: staffStorage });


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

// (Existing Schemas kept exactly same)
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

// 🟢 NEW: STAFF SCHEMA (Management, Teacher, Non-Teaching) 🟢
const staffSchema = new mongoose.Schema({
    category: { type: String, required: true }, // 'management', 'teacher', 'nonteaching'
    role: { type: String, required: true }, // 'Principal', 'Guard', etc.
    empId: { type: String, required: true, unique: true }, // e.g. ZHI-EMP-101
    
    // 🟢 NAYA ADD KIYA: Password field
    password: { type: String, required: true },
    
    // Basic Details
    name: { type: String, required: true },
    fatherName: String,
    dob: String,
    gender: String,
    mobile: { type: String, required: true },
    email: { type: String }, // Optional for Guard/Sweeper
    address: String,
    contact: String, // Contact for table display (Email or Mobile)
    
    // Identity Details
    aadhaar: String,
    pan: String,
    
    // Education & Skills (Mostly for Teachers/Management)
    qualification: String,
    university: String,
    experience: String,
    skills: String,
    
    // Job Details
    joinDate: String,
    dept: String,
    shift: String,
    salary: Number,
    status: { type: String, default: "Active" }, // 'Active' or 'Disabled'
    
    // Bank Details
    bankName: String,
    accNumber: String,
    ifsc: String,

    // File Upload Links (Cloudinary)
    profilePicUrl: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    certUrl: { type: String, default: "" }
}, { timestamps: true });
const Staff = mongoose.model('Staff', staffSchema);


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
// Login API (UPDATED FOR STAFF/TEACHER LOGIN)
// ------------------------------------------
app.post('/api/login', async (req, res) => {
    const { role, email, password } = req.body;
    try {
        // 1. STUDENT LOGIN
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
        
        // 2. DIRECTOR / SUPER ADMIN LOGIN (Checks 'User' schema)
        else if (role.toLowerCase() === 'director') {
            const user = await User.findOne({ email, password, role: 'director' });
            if (user) {
                return res.status(200).json({ success: true, message: "Welcome Admin!", role: user.role });
            }
        } 
        
     // 3. HOD / ACCOUNTANT / STAFF / TEACHER LOGIN (Checks 'Staff' schema)
        else if (['hod', 'accountant', 'staff', 'teacher'].includes(role.toLowerCase())) {
            
            // Frontend se aaye hue role ko Database ki Category se match karenge
            // Teacher ke liye category 'teacher' hogi, baaki sab (HOD, Accountant, Staff) 'management' me aate hain
            let dbCategory = 'management'; 
            if (role.toLowerCase() === 'teacher') {
                dbCategory = 'teacher';
            }
            
            // Database me Staff dhoondo
            const staffUser = await Staff.findOne({ email, password, category: dbCategory });
            
            if (staffUser) {
                // Agar Admin ne account disable kar diya hai
                if (staffUser.status === 'Disabled') {
                    return res.status(403).json({ success: false, message: "Your account is disabled. Please contact Director." });
                }

                // Login Success 
                return res.status(200).json({ 
                    success: true, 
                    message: "Welcome " + staffUser.name, 
                    role: role, // HTML ko wahi role return karega taaki sahi dashboard khule
                    staffId: staffUser._id,
                    staffName: staffUser.name
                });
            }
        }

        // Agar koi password/email DB me na mile
        res.status(401).json({ success: false, message: "Invalid Email or Password!" });

    } catch (err) { 
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error!" }); 
    }
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


// 🟢 GLOBAL NOTICE APIs 🟢
app.post('/api/notices', uploadNotice.single('attachment'), async (req, res) => {
    try {
        const { title, message, priority, audience } = req.body;
        
        let fileUrl = "";
        if (req.file) {
            let tempUrl = req.file.secure_url || req.file.path;
            fileUrl = tempUrl.replace(/\.pdf$/i, '.png'); 
        }

        let parsedAudience = [];
        try { parsedAudience = JSON.parse(audience); } 
        catch (e) { parsedAudience = audience ? audience.split(',') : []; }

        const newNotice = new Notice({ title, message, priority, audience: parsedAudience, fileUrl });
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
        const { title, message, priority, audience } = req.body;
        let updateData = { title, message, priority };
        
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


// 🟢 NEW: STAFF (USERS & ROLES) APIs 🟢

// 1. ADD NEW STAFF (Uploads 3 files: profilePic, resumeFile, certFile)
app.post('/api/staff', uploadStaff.fields([
    { name: 'profilePic', maxCount: 1 }, 
    { name: 'resumeFile', maxCount: 1 }, 
    { name: 'certFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const staffData = req.body;

        // Ensure Employee ID is unique
        const existingStaff = await Staff.findOne({ empId: staffData.empId });
        if(existingStaff) return res.status(400).json({ success: false, message: "Employee ID already exists!" });

        // Grab Cloudinary Uploaded Links and Convert PDF to PNG 🟢
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

// 2. GET ALL STAFF
app.get('/api/staff', async (req, res) => {
    try {
        const staffList = await Staff.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: staffList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. EDIT STAFF
app.put('/api/staff/:id', uploadStaff.fields([
    { name: 'profilePic', maxCount: 1 }, 
    { name: 'resumeFile', maxCount: 1 }, 
    { name: 'certFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const updateData = req.body;

        // Replace old links if new files are uploaded and Convert PDF to PNG 🟢
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

// 4. DELETE STAFF
app.delete('/api/staff/:id', async (req, res) => {
    try {
        const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
        if (!deletedStaff) return res.status(404).json({ success: false, message: "Staff not found!" });

        res.status(200).json({ success: true, message: "Staff Data Deleted!" });
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
