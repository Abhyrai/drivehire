const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Avatar uploads
const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'drivehire/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }]
    }
});

// Document uploads (license, aadhaar, ID proof)
const documentStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'drivehire/documents',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
        resource_type: 'auto'
    }
});

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadDocuments = multer({
    storage: documentStorage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { cloudinary, uploadAvatar, uploadDocuments };
