const express = require('express');
const { registerTeacher } = require('../controllers/user/user');
const { loginUser } = require('../controllers/auth/auth');
const router = express.Router();

router.post('/signUp-teacher', registerTeacher);
router.post('/login', loginUser);

module.exports = router;