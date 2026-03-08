const Advertisement = require('../models/AdvertisementModel');

// GET all advertisements
const getAllAdvertisements = async (req, res) => {
    try {
        const advertisements = await Advertisement.find().sort({ date: -1 });
        return res.status(200).json({ advertisements });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// POST - add new advertisement
const addAdvertisement = async (req, res) => {
    const { name, description, phoneNumber, price, imageUrl, paymentSlip, packageType, date } = req.body;
    console.log("Received data:", { name, description, phoneNumber, price, imageUrl: imageUrl?.length, paymentSlip: paymentSlip?.length, packageType });
    try {
        if (!name || !description || !phoneNumber || !price || !packageType) {
            return res.status(400).json({ message: "Missing required fields", received: { name, description, phoneNumber, price, packageType } });
        }
        const advertisement = new Advertisement({
            name,
            description,
            phoneNumber,
            price: Number(price),
            imageUrl,
            paymentSlip,
            packageType,
            date: date || Date.now(),
        });
        await advertisement.save();
        return res.status(201).json({ advertisement });
    } catch (err) {
        console.error("Error adding advertisement:", err.message);
        return res.status(400).json({ message: "Unable to add advertisement", error: err.message });
    }
};

// GET by ID
const getById = async (req, res) => {
    try {
        const advertisement = await Advertisement.findById(req.params.id);
        if (!advertisement) return res.status(404).json({ message: "Advertisement Not Found" });
        return res.status(200).json({ advertisement });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// PUT - update advertisement
const updateAdvertisement = async (req, res) => {
    const { name, description, phoneNumber, price, imageUrl, paymentSlip, packageType, date } = req.body;
    try {
        const advertisement = await Advertisement.findByIdAndUpdate(
            req.params.id,
            { name, description, phoneNumber, price: Number(price), imageUrl, paymentSlip, packageType, date },
            { new: true, runValidators: true }
        );
        if (!advertisement) return res.status(404).json({ message: "Advertisement Not Found" });
        return res.status(200).json({ advertisement });
    } catch (err) {
        return res.status(400).json({ message: "Update failed", error: err.message });
    }
};

// DELETE advertisement
const deleteAdvertisement = async (req, res) => {
    try {
        const advertisement = await Advertisement.findByIdAndDelete(req.params.id);
        if (!advertisement) return res.status(404).json({ message: "Advertisement Not Found" });
        return res.status(200).json({ message: "Advertisement Deleted Successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getAllAdvertisements = getAllAdvertisements;
exports.addAdvertisement = addAdvertisement;
exports.getById = getById;
exports.updateAdvertisement = updateAdvertisement;
exports.deleteAdvertisement = deleteAdvertisement;