
const express = require('express');
const router = express.Router();
const FileController = require('../controllers/fileController');
const checkAuthorization = require('../middleware');
const Upload =  require('../middleware/upload');

router.get('/uploadYoutube', FileController.uploadYoutube);
router.get('/getCaption', FileController.generateSRT);

module.exports = router;