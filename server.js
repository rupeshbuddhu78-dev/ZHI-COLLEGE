const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json()); 
// Isse tumhari saari HTML, CSS, Images 'public' folder se load hongi
app.use(express.static(path.join(__dirname, 'public')));

// --- 1. DATABASE CONNECTION ---
mongoose.connect('mongodb://127.0.0.1:27017/schoolDB')
.then(() => {
    console.log("✅ MongoDB Connected Successfully!");
}).catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
});

// --- 2. SCHEMAS & MODELS ---

// A. User Schema (Admin/Staff Login ke liye)
const userSchema = new mongoose.Schema({
    role: { type: String, required: true }, // director, accounts, faculty
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// B. Student Schema (Tumhara original schema saare fields ke saath)
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
    password: { type: String, required: true }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

// --- 3. API ROUTES ---

// Default Route: Login Page dikhane ke liye
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login API: Authenticate Admin/Staff
app.post('/api/login', async (req, res) => {
    const { role, email, password } = req.body;
    try {
        const user = await User.findOne({ email, role, password });
        if (user) {
            res.status(200).json({ success: true, message: "Welcome to ZHI Portal!", role: user.role });
        } else {
            res.status(401).json({ success: false, message: "Invalid Credentials or Role!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error!" });
    }
});

// Student Registration API (Data save karne ke liye)
app.post('/api/add-student', async (req, res) => {
    try {
        const newStudent = new Student({
            ...req.body,
            password: req.body.studentMobile 
        });

        await newStudent.save();
        res.status(201).json({ success: true, message: 'Student admitted successfully!' });

    } catch (error) {
        console.error("Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Ye Email pehle se register hai!' });
        }
        res.status(500).json({ success: false, message: 'Server error!' });
    }
});

// GET ALL STUDENTS (Database se data lakar table mein dikhane ke liye)
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ success: false, message: 'Server error fetching students!' });
    }
});

// 🔥 NAYA API: UPDATE (EDIT) STUDENT 🔥
app.put('/api/students/:id', async (req, res) => {
    try {
        // ID se student find karega aur update kar dega
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        if (!updatedStudent) {
            return res.status(404).json({ success: false, message: 'Student not found!' });
        }
        
        res.status(200).json({ success: true, message: 'Student details updated!', data: updatedStudent });
    } catch (error) {
        console.error("Edit Error:", error);
        res.status(500).json({ success: false, message: 'Server error updating student!' });
    }
});

// 🔥 NAYA API: DELETE STUDENT 🔥
app.delete('/api/students/:id', async (req, res) => {
    try {
        // ID se student dhoondh kar delete kar dega
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        
        if (!deletedStudent) {
            return res.status(404).json({ success: false, message: 'Student not found!' });
        }

        res.status(200).json({ success: true, message: 'Student deleted successfully!' });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, message: 'Server error deleting student!' });
    }
});

// --- 4. DEFAULT ADMIN CREATION (Initial Seed) ---
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
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});