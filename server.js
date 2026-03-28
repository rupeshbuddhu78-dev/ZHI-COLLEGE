const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer'); 
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const https = require('https'); // 🔴 ADDED: Server ko awake rakhne ke liye

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

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiStudentProfiles', 
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'], 
    },
});
const upload = multer({ storage: storage });

// --- 3. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://rupeshdatabase:rupeshkumar9091@cluster0.2zu9ek1.mongodb.net/zhi_college?retryWrites=true&w=majority")
.then(() => console.log("✅ Cloud MongoDB Connected Successfully! 🔥"))
.catch((err) => console.log("❌ MongoDB Connection Error:", err));

// --- 4. EMAIL SETUP (🔴 UPDATED FOR SECURITY & LOGGING) ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'rupesh.c.0828@zhi.org.in', 
        pass: 'dyju pxba misf qfuk' 
    }
});

// Server start par check karega ki Email ready hai ya nahi
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

// --- 6. API ROUTES ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login API (Students & Admin)
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
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error!" });
    }
});

// Add Student (Returns studentId for next step: photo upload)
app.post('/api/add-student', async (req, res) => {
    try {
        const newStudent = new Student({
            ...req.body,
            password: req.body.studentMobile // Default password is mobile number
        });
        const savedStudent = await newStudent.save();
        res.status(201).json({ 
            success: true, 
            message: 'Student added successfully!', 
            studentId: savedStudent._id 
        });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Email already exists!' });
        res.status(500).json({ success: false, message: 'Server error!' });
    }
});

// Photo Upload Route
app.post('/api/upload-photo/:id', upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded!' });

        const photoUrl = req.file.path;
        const student = await Student.findByIdAndUpdate(
            req.params.id, 
            { profilePicUrl: photoUrl }, 
            { new: true }
        );

        if (!student) return res.status(404).json({ success: false, message: 'Student not found!' });

        res.status(200).json({ success: true, message: 'Photo Updated!', profilePicUrl: photoUrl });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Upload failed!' });
    }
});

// Get All Students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error!' });
    }
});

// Update Student
app.put('/api/students/:id', async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStudent) return res.status(404).json({ success: false, message: 'Student not found!' });
        res.status(200).json({ success: true, message: 'Student details updated!', data: updatedStudent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error!' });
    }
});

// Delete Student
app.delete('/api/students/:id', async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) return res.status(404).json({ success: false, message: 'Student not found!' });
        res.status(200).json({ success: true, message: 'Student deleted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error!' });
    }
});

// Forgot Password (OTP)
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
        console.log("❌ OTP Bhejney mein error aya:", err); // 🔴 CHANGED: Added Log
        res.status(500).json({ success: false, message: "Error sending email!" });
    }
});

// Reset Password
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
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error!" });
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
    const SERVER_URL = 'https://zhi-college.onrender.com'; // 🔴 Aapka URL add kar diya
    
    https.get(SERVER_URL, (res) => {
        if (res.statusCode === 200) {
            console.log('⏰ Server khud ko ping kar raha hai taaki soye nahi! (Status: 200)');
        }
    }).on('error', (err) => {
        console.log('❌ Ping fail ho gaya:', err.message);
    });
};

// Har 14 minute (14 * 60 * 1000 ms) mein server khud ko ping karega
setInterval(keepAlive, 14 * 60 * 1000);

// --- 9. START SERVER ---
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
