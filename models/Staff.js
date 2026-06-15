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
// 🔥 FIX: 'next' ko call kiya aur try-catch lagaya taaki kisi bhi situation mein server hang na ho
staffSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error); // Agar hashing mein dikkat aaye toh error aage pass ho jaye
    }
});

staffSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
