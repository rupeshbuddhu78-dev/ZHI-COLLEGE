const mongoose = require('mongoose'); // 🔥 FIX 1: Mongoose ko import kiya

// NOTICE SCHEMA
const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, default: "info" },
    audience: [{ type: String }],
    fileUrl: { type: String, default: "" },
    postedBy: { type: String, default: "Director Office" }
}, { timestamps: true });

// 🔥 FIX 2: Isko export kiya taaki baaki files isko use kar sakein
module.exports = mongoose.model('Notice', noticeSchema);
