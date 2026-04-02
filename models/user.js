const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    role: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetOtp: String, otpExpiry: Date          
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
    resetOtp: String, otpExpiry: Date,
    profilePicUrl: { type: String, default: "" } 
}, { timestamps: true });
const Student = mongoose.model('Student', studentSchema);

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

module.exports = { User, Student, Staff };
