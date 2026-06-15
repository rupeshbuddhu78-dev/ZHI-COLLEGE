const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
    category: { type: String, required: true }, // e.g., 'management', 'teacher', 'nonteaching'
    role: { type: String, required: true },     // e.g., 'Professor', 'Guard', etc.
    empId: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    name: { type: String, required: true },
    fatherName: String, 
    dob: String, 
    gender: String,
    mobile: { type: String, required: true },
    email: { type: String }, 
    address: String, 
    contact: String,
    aadhaar: String, 
    pan: String, 
    qualification: String,
    university: String, 
    experience: String, 
    skills: String,
    joinDate: String, 
    dept: String, 
    shift: String,
    salary: Number, 
    status: { type: String, default: "Active" },
    bankName: String, 
    accNumber: String, 
    ifsc: String,
    profilePicUrl: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    certUrl: { type: String, default: "" }
}, { timestamps: true });

// 🔒 SECURITY HOOK: Database mein save hone se theek pehle password hash karega
// 🔥 FIX: 'next' ko poori tarah hata diya hai kyunki async function khud flow handle karta hai
staffSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return; // Agar password modify nahi hua toh yahin se return ho jao
    }
    
    // Async/Await se salt aur hash generate hoga, bina next() ke smoothly chalega
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

staffSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
