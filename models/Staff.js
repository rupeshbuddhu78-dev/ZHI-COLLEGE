const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
    category: { type: String, required: true }, // e.g., 'Teaching', 'Non-Teaching'
    role: { type: String, required: true },     // e.g., 'Teacher', 'HOD', 'Accountant'
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

// 🔒 SECURITY HOOK: Database mein save hone se theek pehle password hash karega
// 🔥 FIX: 'async' ke sath 'next' hataya
staffSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

staffSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
