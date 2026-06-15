const StudentFee = require('../models/StudentFee');
const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const Student = require('../models/Student');

exports.getDashboardStats = async (req, res) => {
    try {
        const transactions = await Transaction.find().populate('studentId').sort({ createdAt: -1 }).limit(20);
        const expenses = await Expense.find().sort({ createdAt: -1 }).limit(20);
        
        const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        const allFees = await StudentFee.find();
        const totalDue = allFees.reduce((sum, f) => sum + f.totalDue, 0);

        res.status(200).json({ success: true, stats: { income: totalIncome, expense: totalExpense, due: totalDue }, transactions, expenses });
    } catch (err) { res.status(500).json({ success: false }); }
};

exports.collectFee = async (req, res) => {
    const { studentId, headId, amount, mode, remarks } = req.body;
    try {
        let feeRecord = await StudentFee.findOne({ studentId });
        const headIndex = feeRecord.feeHeads.findIndex(h => h._id.toString() === headId);
        
        feeRecord.feeHeads[headIndex].paid += Number(amount);
        feeRecord.feeHeads[headIndex].due -= Number(amount);
        if (feeRecord.feeHeads[headIndex].due <= 0) feeRecord.feeHeads[headIndex].status = "Paid";
        feeRecord.totalPaid += Number(amount); feeRecord.totalDue -= Number(amount);
        await feeRecord.save();

        const newTrans = new Transaction({ receiptNo: "REC" + Date.now(), studentId, amount, mode, feeHeadName: feeRecord.feeHeads[headIndex].headName, remarks });
        await newTrans.save();

        res.status(200).json({ success: true, message: "Fee Collected Successfully!", receipt: newTrans });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.addExpense = async (req, res) => {
    try {
        const exp = new Expense({ voucherNo: "EXP" + Date.now(), ...req.body });
        await exp.save();
        res.status(201).json({ success: true, message: "Expense Recorded!" });
    } catch (err) { res.status(500).json({ success: false }); }
};

exports.getStudentFee = async (req, res) => {
    try {
        const feeRecord = await StudentFee.findOne({ studentId: req.params.studentId }).populate('studentId');
        res.status(200).json({ success: true, data: feeRecord });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
