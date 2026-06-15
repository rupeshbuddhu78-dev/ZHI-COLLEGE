const Notice = require('../models/Notice');

exports.createNotice = async (req, res) => {
    try {
        const { title, message, priority, audience, postedBy } = req.body;
        let fileUrl = req.file ? req.file.path.replace(/\.pdf$/i, '.png') : "";
        let parsedAudience = Array.isArray(audience) ? audience : JSON.parse(audience || '[]');
        
        const newNotice = new Notice({ title, message, priority, audience: parsedAudience, fileUrl, postedBy });
        await newNotice.save();
        res.status(201).json({ success: true, message: "Notice sent successfully!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getNotices = async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notices });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteNotice = async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Notice deleted!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
