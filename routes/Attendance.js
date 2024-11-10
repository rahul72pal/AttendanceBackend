const express = require('express');
const { saveAttendance, getAttendance, getStudentAttendance } = require('../controllers/attendance/attendance');
const router = express.Router();

router.post('/saveAttendance', saveAttendance);
router.get('/get', getAttendance);
router.get('/getStudent', getStudentAttendance);

module.exports = router;