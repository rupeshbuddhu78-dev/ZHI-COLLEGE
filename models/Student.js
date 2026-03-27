const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    // Academic Details
    course: String,
    semester: String,
    sessionBatch: String,       // Naya add kiya hua field
    registrationDate: String,
    collegeRegNo: String,
    univRegNo: String,
    
    // Personal Details
    studentName: { type: String, required: true },
    dob: String,
    gender: String,
    bloodGroup: String,
    nationality: String,
    motherTongue: String,
    studentMobile: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    aadharNumber: String,       // Naya add kiya hua field
    category: String,           // Naya add kiya hua field
    religion: String,           // Naya add kiya hua field
    
    // Address Details
    permanentAddress: String,
    city: String,
    state: String,
    pincode: String,            // Naya add kiya hua field
    district: String,           // Naya add kiya hua field
    tempAddress: String,
    
    // Guardian Details
    fatherName: String,
    fatherMobile: String,
    motherName: String,
    motherMobile: String,
    guardianName: String,
    guardianRelation: String,
    guardianMobile: String,
    guardianAddress: String,
    
    // Fee Details
    amountCollected: Number,
    paymentMode: String,
    transactionId: String,
    
    // Credentials
    // Note: Password hum wahi mobile number ko save karenge
    password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);