const mongoose = require('mongoose');

const feeHeadSchema = new mongoose.Schema({
    headName: String, dueDate: String, amount: Number, discount: { type: Number, default: 0 }, 
    fine: { type: Number, default: 0 }, paid: { type: Number, default: 0 }, 
    due: Number, status: { type: String, default: "Due" }
});

const studentFeeSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    totalAmount: Number, totalDiscount: Number, totalPaid: Number, totalDue: Number,
    feeHeads: [feeHeadSchema] 
});
const StudentFee = mongoose.model('StudentFee', studentFeeSchema);

const transactionSchema = new mongoose.Schema({
    receiptNo: { type: String, unique: true }, 
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    date: Date, mode: String, amount: Number, feeHeadName: String, remarks: String,
    payerMobile: String 
}, { timestamps: true });
const Transaction = mongoose.model('Transaction', transactionSchema);

const expenseSchema = new mongoose.Schema({
    voucherNo: { type: String, unique: true }, category: String, date: Date, 
    mode: String, amount: Number, description: String
}, { timestamps: true });
const Expense = mongoose.model('Expense', expenseSchema);

const generateFeeStructure = (courseName) => {
    let baseTuition = (courseName && courseName.toLowerCase() === 'mca') ? 25000 : 16880; 
    let heads = [
        { headName: "Admission Fee", amount: 30000, dueDate: "01-08-2025" },
        { headName: "University Reg. Fees", amount: 2100, dueDate: "30-08-2025" },
        { headName: "1st Sem Tuition - 1st Inst", amount: 12130, dueDate: "30-08-2025" },
        { headName: "1st Sem Tuition - 2nd Inst", amount: 10530, dueDate: "30-11-2025" },
        { headName: "Exam Fees (Sem 1)", amount: 3700, dueDate: "30-11-2025" },
        { headName: "2nd Sem Tuition - 1st Inst", amount: baseTuition, dueDate: "15-02-2026" },
        { headName: "2nd Sem Tuition - 2nd Inst", amount: baseTuition, dueDate: "20-05-2026" },
        { headName: "Exam Fees (Sem 2)", amount: 3700, dueDate: "20-05-2026" }
    ];
    let processedHeads = heads.map(h => ({ ...h, discount: 0, fine: 0, paid: 0, due: h.amount, status: "Due" }));
    let total = processedHeads.reduce((sum, h) => sum + h.amount, 0);
    return { feeHeads: processedHeads, totalAmount: total, totalDue: total, totalPaid: 0, totalDiscount: 0 };
};

module.exports = { StudentFee, Transaction, Expense, generateFeeStructure };
