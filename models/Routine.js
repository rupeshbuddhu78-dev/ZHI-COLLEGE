const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
    course: { type: String, required: true }, // e.g., BCA, BBA
    semester: { type: String, required: true }, // e.g., 1st, 2nd
    subject: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true }, // Teacher ki ID link karne ke liye
    dayOfWeek: { type: String, required: true }, // Monday, Tuesday, etc.
    startTime: { type: String, required: true }, // e.g., "10:00 AM"
    endTime: { type: String, required: true },   // e.g., "11:00 AM"
    roomNumber: { type: String } // Optional: Class kaha hogi
}, { timestamps: true });

module.exports = mongoose.model('Routine', routineSchema);
