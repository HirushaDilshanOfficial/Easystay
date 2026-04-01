const Advertisement = require('../models/AdvertisementModel');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');

// ─── GET all advertisements (with optional status filter) ──────────────────────
const getAllAdvertisements = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.ownerId) filter.ownerId = req.query.ownerId;
        const advertisements = await Advertisement.find(filter).sort({ date: -1 });
        return res.status(200).json({ advertisements });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ─── POST - add new advertisement ─────────────────────────────────────────────
const addAdvertisement = async (req, res) => {
    let { name, description, phoneNumber, price, packageType, date, ownerId } = req.body;
    
    // Extract Cloudinary URLs from req.files
    let imageUrl = '';
    let paymentSlip = '';

    if (req.files) {
        if (req.files.imageUrl && req.files.imageUrl[0]) {
            imageUrl = req.files.imageUrl[0].path;
        }
        if (req.files.paymentSlip && req.files.paymentSlip[0]) {
            paymentSlip = req.files.paymentSlip[0].path;
        }
    }

    try {
        const advertisement = new Advertisement({
            name, description, phoneNumber, price,
            imageUrl, paymentSlip, packageType,
            ownerId,
            status: 'pending',
            date: date || Date.now(),
        });
        await advertisement.save();
        return res.status(201).json({ advertisement });
    } catch (err) {
        return res.status(400).json({ message: "Unable to add advertisement", error: err.message });
    }
};

// ─── GET by ID ─────────────────────────────────────────────────────────────────
const getById = async (req, res) => {
    try {
        const advertisement = await Advertisement.findById(req.params.id);
        if (!advertisement) return res.status(404).json({ message: "Advertisement Not Found" });
        return res.status(200).json({ advertisement });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ─── PUT - update advertisement ───────────────────────────────────────────────
const updateAdvertisement = async (req, res) => {
    let { name, description, phoneNumber, price, packageType, date } = req.body;
    
    const updateData = { name, description, phoneNumber, price, packageType, date, status: 'pending' };

    // Extract Cloudinary URLs if new files were uploaded
    if (req.files) {
        if (req.files.imageUrl && req.files.imageUrl[0]) {
            updateData.imageUrl = req.files.imageUrl[0].path;
        }
        if (req.files.paymentSlip && req.files.paymentSlip[0]) {
            updateData.paymentSlip = req.files.paymentSlip[0].path;
        }
    }

    try {
        const advertisement = await Advertisement.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!advertisement) return res.status(404).json({ message: "Advertisement Not Found" });
        return res.status(200).json({ advertisement });
    } catch (err) {
        return res.status(400).json({ message: "Update failed", error: err.message });
    }
};

// ─── DELETE advertisement ──────────────────────────────────────────────────────
const deleteAdvertisement = async (req, res) => {
    try {
        const advertisement = await Advertisement.findByIdAndDelete(req.params.id);
        if (!advertisement) return res.status(404).json({ message: "Advertisement Not Found" });
        return res.status(200).json({ message: "Advertisement Deleted Successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ─── PUT - approve advertisement ──────────────────────────────────────────────
const approveAdvertisement = async (req, res) => {
    try {
        const advertisement = await Advertisement.findByIdAndUpdate(
            req.params.id,
            { status: 'approved', adminNote: req.body.adminNote || '', reviewedAt: new Date() },
            { new: true }
        );
        if (!advertisement) return res.status(404).json({ message: "Advertisement Not Found" });

        // Send email to owner
        if (advertisement.ownerId) {
            try {
                const owner = await User.findById(advertisement.ownerId);
                if (owner && owner.email) {
                    await sendEmail({
                        email: owner.email,
                        subject: 'Your Advertisement has been Approved! - EasyStay',
                        message: `Congratulations ${owner.name}! Your advertisement for "${advertisement.name}" has been approved and is now live on EasyStay.`,
                        html: `
                            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                                <h2 style="color: #2563EB;">Advertisement Approved!</h2>
                                <p>Hello <strong>${owner.name}</strong>,</p>
                                <p>We are pleased to inform you that your advertisement for <strong>"${advertisement.name}"</strong> has been reviewed and <strong>approved</strong> by our team.</p>
                                <p>It is now visible to students searching for boarding houses on the EasyStay platform.</p>
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0;">
                                    <p style="margin: 0;"><strong>Ad Name:</strong> ${advertisement.name}</p>
                                    <p style="margin: 0;"><strong>Package:</strong> ${advertisement.packageType.toUpperCase()}</p>
                                    <p style="margin: 0;"><strong>Status:</strong> Approved</p>
                                </div>
                                <p>Thank you for choosing EasyStay to manage your properties!</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                                <p style="font-size: 12px; color: #777;">This is an automated message, please do not reply directly to this email.</p>
                            </div>
                        `
                    });
                    console.log(`Ad approval email sent to owner: ${owner.email}`);
                }
            } catch (emailErr) {
                console.error('Failed to send ad approval email:', emailErr);
            }
        }

        return res.status(200).json({ message: "Advertisement Approved", advertisement });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ─── PUT - reject advertisement ───────────────────────────────────────────────
const rejectAdvertisement = async (req, res) => {
    try {
        const { adminNote } = req.body;
        const advertisement = await Advertisement.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', adminNote: adminNote || '', reviewedAt: new Date() },
            { new: true }
        );
        if (!advertisement) return res.status(404).json({ message: "Advertisement Not Found" });
        return res.status(200).json({ message: "Advertisement Rejected", advertisement });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ─── GET - analytics data ──────────────────────────────────────────────────────
const getAnalytics = async (req, res) => {
    try {
        const all = await Advertisement.find();

        const total       = all.length;
        const pending     = all.filter(a => a.status === 'pending').length;
        const approved    = all.filter(a => a.status === 'approved').length;
        const rejected    = all.filter(a => a.status === 'rejected').length;

        // Revenue from approved ads based on package price
        const packagePrices = { basic: 999, standard: 2499, premium: 4999 };
        const totalRevenue  = all
            .filter(a => a.status === 'approved')
            .reduce((sum, a) => sum + (packagePrices[a.packageType] || 0), 0);

        // By package
        const byPackage = ['basic', 'standard', 'premium'].map(pkg => ({
            package: pkg,
            total:    all.filter(a => a.packageType === pkg).length,
            approved: all.filter(a => a.packageType === pkg && a.status === 'approved').length,
            rejected: all.filter(a => a.packageType === pkg && a.status === 'rejected').length,
            pending:  all.filter(a => a.packageType === pkg && a.status === 'pending').length,
            revenue:  all.filter(a => a.packageType === pkg && a.status === 'approved').length * packagePrices[pkg],
        }));

        // Monthly breakdown (last 6 months)
        const monthly = [];
        for (let i = 5; i >= 0; i--) {
            const d     = new Date();
            d.setMonth(d.getMonth() - i);
            const year  = d.getFullYear();
            const month = d.getMonth();
            const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });

            const monthAds = all.filter(a => {
                const ad = new Date(a.date);
                return ad.getFullYear() === year && ad.getMonth() === month;
            });

            monthly.push({
                label,
                total:    monthAds.length,
                approved: monthAds.filter(a => a.status === 'approved').length,
                rejected: monthAds.filter(a => a.status === 'rejected').length,
                pending:  monthAds.filter(a => a.status === 'pending').length,
                revenue:  monthAds.filter(a => a.status === 'approved').reduce((s, a) => s + (packagePrices[a.packageType] || 0), 0),
            });
        }

        return res.status(200).json({
            summary: { total, pending, approved, rejected, totalRevenue },
            byPackage,
            monthly,
        });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getAllAdvertisements  = getAllAdvertisements;
exports.addAdvertisement      = addAdvertisement;
exports.getById               = getById;
exports.updateAdvertisement   = updateAdvertisement;
exports.deleteAdvertisement   = deleteAdvertisement;
exports.approveAdvertisement  = approveAdvertisement;
exports.rejectAdvertisement   = rejectAdvertisement;
exports.getAnalytics          = getAnalytics;