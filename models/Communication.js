const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, default: "info" }, 
    audience: [{ type: String }], 
    fileUrl: { type: String, default: "" }, 
    postedBy: { type: String, default: "Director Office" }
}, { timestamps: true });
const Notice = mongoose.model('Notice', noticeSchema);

const leaveSchema = new mongoose.Schema({
    applicantId: { type: String, required: true },
    applicantName: { type: String, required: true },
    applicantRole: { type: String, required: true }, // Student, Teacher, Staff
    leaveType: { type: String, default: "General" }, 
    startDate: { type: String, required: true }, 
    endDate: { type: String, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    documentUrl: { type: String, default: "" }, // PNG File URL
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    hodRemark: { type: String, default: "" }
}, { timestamps: true });
const Leave = mongoose.model('Leave', leaveSchema);

module.exports = { Notice, Leave };
