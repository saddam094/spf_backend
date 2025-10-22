const express = require('express');
const router = express.Router();
const { register, login, getProfilePresignedUrl } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/get_profile_presigned_url', getProfilePresignedUrl);

module.exports = router;
