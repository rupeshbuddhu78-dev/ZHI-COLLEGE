const mongoose = require('mongoose'); // 🔥 FIX 1: Mongoose import kiya

const expenseSchema = new mongoose.Schema({
    voucherNo: { type: String, unique: true }, 
    category: String, 
    date: Date,
    mode: String, 
    amount: Number, 
    description: String
}, { timestamps: true });

// 🔥 FIX 2: Is model ko export kiya taaki controllers isko use kar sakein
module.exports = mongoose.model('Expense', expenseSchema);
