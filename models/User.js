const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    role: { type: String, required: true }, // Example: 'admin', 'staff', 'accountant'
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetOtp: String,
    otpExpiry: Date
}, { timestamps: true }); // timestamps: true add karna best practice hai (createdAt, updatedAt ke liye)

// 🔒 SECURITY HOOK: User save hone se pehle password encrypt karega
userSchema.pre('save', async function(next) {
    // Agar password update nahi hua hai (jaise sirf role ya email update kar rahe hain), toh skip karo
    if (!this.isModified('password')) {
        return next();
    }
    
    // Password ko secure hash mein convert karo
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 🔑 LOGIN HELPER: User ke entered password ko database wale hashed password se compare karega
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
