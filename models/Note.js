// NOTES SCHEMA 
const mongoose = require('mongoose');
const noteSchema = new mongoose.Schema({
    date: { type: String, required: true },
    semester: { type: String, required: true },
    subject: { type: String, required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    teacherId: { type: String, required: true }  // 🔴 YE LINE NAYI ADD HUI HAI
}, { timestamps: true });
const Note = mongoose.model('Note', noteSchema);
