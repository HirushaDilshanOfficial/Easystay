const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
        cb(null, uniqueName);
    },
});

// File filter – allow only images and videos
const fileFilter = function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|webp|mp4|mov|avi|mkv|pdf/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowedTypes.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only image (jpg, png, webp, pdf) and video (mp4, mov) files allowed!"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

module.exports = upload;
