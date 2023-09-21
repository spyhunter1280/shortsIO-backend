
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const checkAuthorization = require('../middleware');
const Upload =  require('../middleware/upload');

router.post('/signup', AuthController.signup);
router.post('/verify', AuthController.verify);
router.post('/login', AuthController.login);
router.post('/profile', checkAuthorization, AuthController.profile);
router.post('/avatar', checkAuthorization, AuthController.avatar);
router.get('/test',AuthController.test);
router.get("/image/:filename", AuthController.display);

module.exports = router;