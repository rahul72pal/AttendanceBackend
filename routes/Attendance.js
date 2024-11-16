const express = require('express');
const { saveAttendance, getAttendance, getStudentAttendance } = require('../controllers/attendance/attendance');
const router = express.Router();

router.post('/saveAttendance', saveAttendance);
router.post('/get', getAttendance);
router.post('/getStudent', getStudentAttendance);

module.exports = router;