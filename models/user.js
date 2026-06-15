const userSchema = new mongoose.Schema({
    role: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetOtp: String,
    otpExpiry: Date
});
const User = mongoose.model('User', userSchema);
