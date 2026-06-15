const Student = require('../models/Student');
const Fee = require('../models/Fee'); 

exports.addStudent = async (req, res) => {
    try {
        // [DEBUG] Check karne ke liye ki frontend se data aa bhi raha hai ya nahi
        console.log("➡️ Incoming Student Data:", req.body);

        const newStudent = new Student({ 
            ...req.body, 
            password: req.body.studentMobile 
        });
        const savedStudent = await newStudent.save();

        // Fee Record Creation
        const newFeeRecord = new Fee({
            studentId: savedStudent._id,
            totalFee: req.body.courseFee || 0, 
            paid: 0,
            due: req.body.courseFee || 0
        });
        await newFeeRecord.save();

        res.status(201).json({ success: true, message: 'Student added successfully!', studentId: savedStudent._id });
    } catch (error) {
        // 🔥 FIX: Yeh line terminal me bura wala crash print karegi jise dekh kar sab samajh aa jayega
        console.error("🔥 ACTUAL BACKEND ERROR:", error); 
        
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email ya Mobile number already exists!' });
        }
        
        // Testing ke liye actual error bhej rahe hain taaki asaani ho
        res.status(500).json({ success: false, message: 'Server error!', details: error.message });
    }
};
