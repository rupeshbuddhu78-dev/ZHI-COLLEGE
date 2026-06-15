// 📁 routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const { getAllStudents, deleteStudent } = require('../controllers/studentController');

router.get('/', getAllStudents);  // Yeh automatically '/api/students' ban jayega server.js mein
router.delete('/:id', deleteStudent); 
// router.post('/add-student', ...); 

module.exports = router;
