const express = require('express');
const { createStudent } = require('../controllers/student/student');
const router = express.Router();

router.post('/create', createStudent);


module.exports = router;
