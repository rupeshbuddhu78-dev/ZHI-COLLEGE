const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    receiptNo: { type: String, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    date: Date, mode: String, amount: Number, feeHeadName: String, remarks: String,
    payerMobile: String
}, { timestamps: true });
const Transaction = mongoose.model('Transaction', transactionSchema);
