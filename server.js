const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer'); 
// 🔴 NAYE PACKAGES PHOTO UPLOAD KE LIYE 🔴
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE -
app.use(cors());
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

// --- CLOUDINARY CONFIGURATION ---
// 🔴 Yahan tumhari API keys set ki hain
cloudinary.config({ 
    cloud_name: 'dzbpiv7ds', 
    api_key: '812196161439545', 
    api_secret: 'gWdxF2wJvGeuMqvpDgmNogS2pdY' 
});

// --- MULTER STORAGE SETUP (Cloudinary Godown) ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ZhiStudentProfiles', // Is folder mein sab bacho ki photo jayegi
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'], 
    },
});
const upload = multer({ storage: storage });

// --- 1. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://rupeshdatabase:rupeshkumar9091@cluster0.2zu9ek1.mongodb.net/zhi_college?retryWrites=true&w=majority")
.then(() => console.log("✅ Cloud MongoDB Connected Successfully! 🔥"))
.catch((err) => console.log("❌ MongoDB Connection Error:", err));

// --- EMAIL TRANSPORTER SETUP ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rupesh.c.0828@zhi.org.in', 
        pass: 'dyju pxba misf qfuk' 
    }
});

// --- 2. SCHEMAS & MODELS ---

const userSchema = new mongoose.Schema({
    role: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetOtp: { type: String },       
    otpExpiry: { type: Date }         
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
    resetOtp: { type: String },       
    otpExpiry: { type: Date },
    profilePicUrl: { type: String, default: "" } // 🔴 NAYA FIELD PHOTO LINK KE LIYE
}, { timestamps: true });
const Student = mongoose.model('Student', studentSchema);


// --- 3. API ROUTES ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login API
app.post('/api/login', async (req, res) => {
    const { role, email, password } = req.body;
    try {
        if (role === 'Student' || role === 'student') {
            const student = await Student.findOne({ email: email, password: password });
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
                    profilePicUrl: student.profilePicUrl || "" // 🔴 YAHAN SE APP MEIN LINK JAYEGA
                });
            } else {
                return res.status(401).json({ success: false, message: "Invalid Email or Password!" });
            }
        } else {
            const user = await User.findOne({ email: email, role: role, password: password });
            if (user) {
                return res.status(200).json({ success: true, message: "Welcome Admin!", role: user.role });
            } else {
                return res.status(401).json({ success: false, message: "Invalid Admin Credentials or Role!" });
            }
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "Server Error!" });
    }
});


// 🔥 NAYA API: PROFILE PHOTO UPLOAD 🔥
app.post('/api/upload-photo/:id', upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Koi photo miley nahi!' });
        }

        const studentId = req.params.id;
        const photoUrl = req.file.path; // Cloudinary se aaya hua link

        const student = await Student.findByIdAndUpdate(
            studentId, 
            { profilePicUrl: photoUrl }, 
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student nahi mila!' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Photo Cloudinary aur Database mein save ho gayi! 🎉', 
            profilePicUrl: photoUrl 
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ success: false, message: 'Server error!' });
    }
});


// Add Student
app.post('/api/add-student', async (req, res) => {
    try {
        const newStudent = new Student({
            ...req.body,
            password: req.body.studentMobile 
        });
        await newStudent.save();
        res.status(201).json({ success: true, message: 'Student admitted successfully!' });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Ye Email pehle se register hai!' });
        res.status(500).json({ success: false, message: 'Server error!' });
    }
});

app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error!' });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStudent) return res.status(404).json({ success: false, message: 'Student not found!' });
        res.status(200).json({ success: true, message: 'Student details updated!', data: updatedStudent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error!' });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) return res.status(404).json({ success: false, message: 'Student not found!' });
        res.status(200).json({ success: true, message: 'Student deleted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error!' });
    }
});

// FORGOT PASSWORD
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        let user = await Student.findOne({ email });
        let isStudent = true;

        if (!user) {
            user = await User.findOne({ email });
            isStudent = false;
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "Is email se koi account nahi mila!" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; 
        await user.save();

        const mailOptions = {
            from: 'rupesh.c.0828@zhi.org.in', 
            to: user.email,
            subject: 'ZHI App - Password Reset OTP',
            text: `Aapka Password Reset OTP hai: ${otp}\n\nYeh OTP 10 minute tak valid rahega. Agar aapne request nahi ki hai toh is message ko ignore karein.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email bhejney mein error:", error);
                return res.status(500).json({ success: false, message: "OTP bhejne mein error aayi. Please baad mein try karein." });
            }
            res.status(200).json({ success: true, message: "OTP aapke registered email par bhej diya gaya hai!" });
        });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ success: false, message: "Server Error!" });
    }
});

// RESET PASSWORD
app.post('/api/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        let user = await Student.findOne({ email });
        if (!user) {
            user = await User.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        if (user.resetOtp !== otp) {
            return res.status(400).json({ success: false, message: "Galat OTP!" });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP expire ho gaya hai! Naya OTP bhejein." });
        }

        user.password = newPassword;
        user.resetOtp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Password successfully change ho gaya hai! Ab aap naye password se login kar sakte hain." });

    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ success: false, message: "Server Error!" });
    }
});

// --- 4. DEFAULT ADMIN CREATION ---
const seedAdmin = async () => {
    const adminExists = await User.findOne({ email: 'admin@zhi.edu.in' });
    if (!adminExists) {
        await User.create({
            role: 'director',
            email: 'admin@zhi.edu.in',
            password: 'admin123'
        });
        console.log("👤 Default Admin Account Created: admin@zhi.edu.in / admin123");
    }
};
seedAdmin();

// --- 5. SERVER START ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
