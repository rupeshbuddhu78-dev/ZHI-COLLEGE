const Routine = require('../models/Routine');

exports.setRoutine = async (req, res) => {
    try {
        const { course, semester, day, periods } = req.body;
        const newRoutine = await Routine.findOneAndUpdate(
            { course, semester, day },
            { course, semester, day, periods },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true, message: "Routine updated successfully!", data: newRoutine });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getRoutine = async (req, res) => {
    try {
        const query = req.query.course ? { course: req.query.course, semester: req.query.semester } : {};
        const routine = await Routine.find(query);
        res.status(200).json({ success: true, data: routine });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
