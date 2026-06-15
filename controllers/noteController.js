const Note = require('../models/Note');

exports.uploadNote = async (req, res) => {
    try {
        const fileUrl = req.file ? req.file.path : "";
        const newNote = new Note({ ...req.body, fileUrl });
        await newNote.save();
        res.status(201).json({ success: true, message: "Notes uploaded successfully!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getNotes = async (req, res) => {
    try {
        const query = req.query.course ? { course: req.query.course, semester: req.query.semester } : {};
        const notes = await Note.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notes });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
