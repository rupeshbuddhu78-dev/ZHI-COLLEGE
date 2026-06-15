const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Yeh package install karna padega: npm i bcryptjs

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
    password: { type: String, required: true }, // Ise hum encrypt karenge
    resetOtp: String,
    otpExpiry: Date,
    profilePicUrl: { type: String, default: "" }
}, { timestamps: true });

// 🔒 SECURITY HOOK: Database mein save hone se theek pehle password hash karega
studentSchema.pre('save', async function(next) {
    // Agar password update nahi ho raha hai, toh skip karo
    if (!this.isModified('password')) {
        return next();
    }
    
    // 10 rounds ki complexity ke sath salt generate karo aur password encrypt karo
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 🔑 LOGIN HELPER: User jo password daalega usko database wale hashed password se match karega
studentSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);

// Model ko export kar rahe hain taaki baaki files mein use ho sake
module.exports = Student;
