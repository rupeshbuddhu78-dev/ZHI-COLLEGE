const Leave = require('../models/Leave');

exports.applyLeave = async (req, res) => {
    try {
        const documentUrl = req.file ? req.file.path : "";
        const newLeave = new Leave({ ...req.body, documentUrl });
        await newLeave.save();
        res.status(201).json({ success: true, message: "Leave applied successfully!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getStaffLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ staffId: req.params.staffId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: leaves });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find().populate('staffId', 'name empId dept role').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: leaves });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id, status, remark } = req.body;
        const updatedLeave = await Leave.findByIdAndUpdate(id, { status: status, hodRemark: remark }, { new: true });
        if (!updatedLeave) return res.status(404).json({ success: false, message: "Leave record not found!" });
        res.status(200).json({ success: true, message: `Leave ${status} successfully!`, data: updatedLeave });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
