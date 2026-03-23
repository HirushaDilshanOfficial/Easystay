const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
} = require('../config/config');

// Configure Cloudinary
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

// Create Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'easystay/others';

        if (file.fieldname === 'nicPhoto') folder = 'easystay/nic';
        if (file.fieldname === 'facePhoto') folder = 'easystay/faces';
        if (file.fieldname === 'boardingDocuments') folder = 'easystay/documents';

        return {
            folder: folder,
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
            public_id: `${Date.now()}-${file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_')}`
        };
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Fields for boarding owner signup
const boardingOwnerUpload = upload.fields([
    { name: 'nicPhoto', maxCount: 1 },
    { name: 'facePhoto', maxCount: 1 },
    { name: 'boardingDocuments', maxCount: 5 }
]);

module.exports = { upload, boardingOwnerUpload };
