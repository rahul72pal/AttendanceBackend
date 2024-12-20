const express = require('express');
const { createStudent, getStudentDetailsById } = require('../controllers/student/student');
const { getStudentAttendance } = require('../controllers/attendance/attendance');
const router = express.Router();

router.post('/create', createStudent);

router.post('/parentAttendance', async (req, res) => {
    const { class_id, roll_no, name } = req.body;
    try {

      const student = await getStudentDetailsById(roll_no, name);

      if(!student){
        res
        .status(400)
        .json({ error: "No Student Found For this Details!" });
      }

      console.log(student._id.toString());
      res.status(200).json(student);
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving student attendance." });
    }}
);


module.exports = router;
