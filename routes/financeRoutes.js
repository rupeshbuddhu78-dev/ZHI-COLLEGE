const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

// Fee Routes
router.post('/fee', financeController.collectFee);
router.get('/fee', financeController.getAllFees);

// 🔥 STUDENT APP ROUTE: App se GET request hit hogi is URL par
router.get('/fee/:studentId', financeController.getStudentFees); 

// Expense Routes
router.post('/expense', financeController.addExpense);
router.get('/expense', financeController.getAllExpenses);

module.exports = router;
