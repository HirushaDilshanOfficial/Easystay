const Report = require('../models/ReportModel');

exports.createReport = async (req, res) => {
    try {
        const { boardingId, reason, details } = req.body;
        const report = new Report({
            reporterId: req.user.id,
            boardingId,
            reason,
            details
        });
        await report.save();
        res.status(201).json({ success: true, data: report });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find().populate('reporterId', 'name email role').sort('-createdAt');
        res.status(200).json({ success: true, data: reports });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ reporterId: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, data: reports });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateReportStatus = async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status, adminResponse },
            { new: true, runValidators: true }
        );
        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }
        res.status(200).json({ success: true, data: report });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        await Report.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Report deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
