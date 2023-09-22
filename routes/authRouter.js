
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const checkAuthorization = require('../middleware');
const Upload =  require('../middleware/upload');

router.get('/test',AuthController.test);
router.get("/image/:filename", AuthController.display);

module.exports = router;