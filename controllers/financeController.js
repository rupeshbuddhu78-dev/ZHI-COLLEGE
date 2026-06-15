const Fee = require('../models/Fee');
const Expense = require('../models/Expense');

// 🟢 1. Pay/Submit Fee (Admin/Accountant use karega)
exports.collectFee = async (req, res) => {
    try {
        const newFee = new Fee(req.body);
        await newFee.save();
        res.status(201).json({ success: true, message: "Fee collected successfully!", data: newFee });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// 🟢 2. Get Single Student Fee History (🔥 YAHI STUDENT APP MEIN DIKHEGA 🔥)
exports.getStudentFees = async (req, res) => {
    try {
        // App se student ka ID aayega, aur uski saari fee history nikal aayegi
        const fees = await Fee.find({ studentId: req.params.studentId }).sort({ paymentDate: -1 });
        
        // Fee Dues (Bacha hua paisa) calculate karne ka logic bhi yahan laga sakte ho
        // (Ya phir tumhare frontend/app mein total minus paid wala logic hoga)
        
        res.status(200).json({ success: true, data: fees });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// 🟢 3. Get All Fees (Admin Dashboard ke liye)
exports.getAllFees = async (req, res) => {
    try {
        const fees = await Fee.find().populate('studentId', 'studentName collegeRegNo course semester').sort({ paymentDate: -1 });
        res.status(200).json({ success: true, data: fees });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// 🔴 4. Add Expense (Kharcha)
exports.addExpense = async (req, res) => {
    try {
        const newExpense = new Expense(req.body);
        await newExpense.save();
        res.status(201).json({ success: true, message: "Expense added successfully!" });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// 🔴 5. Get All Expenses
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.status(200).json({ success: true, data: expenses });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
};
