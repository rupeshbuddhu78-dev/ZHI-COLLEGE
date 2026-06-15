// STAFF SCHEMA
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
