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
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Creates unique filename: timestamp-originalname
        const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
        cb(null, uniqueName);
    },
});

// File filter – allow images and videos only
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|webp/;
    const allowedVideoTypes = /mp4|mov|avi|mkv/;
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");

    if (allowedImageTypes.test(ext) || allowedVideoTypes.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only image (jpg, png, webp) and video (mp4, mov) files are allowed!"), false);
    }
};

// Upload limits: 10MB per file, max 10 files
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
