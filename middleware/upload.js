const multer = require('multer');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config()
const storage = multer.diskStorage({
    destination: '/home/ubuntu/shortsIO-backend/uploads/',
    filename: function (req, file, cb) {
        cb(null, Date.now()+'--'+file.originalname);
    },
});
const Upload = multer({ storage: storage });

module.exports = Upload;