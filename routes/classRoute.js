const express = require("express");
const { createClass, getAllCalsses, getClassAllAttendance } = require("../controllers/calss/class");
const { getAllStudentByClassInOrder } = require("../controllers/student/student");
const { authenticateJWT } = require("../middlewares/authMiddleware");
const { getStudentsWithAttendance } = require("../controllers/attendance/attendance");
const router = express.Router();

router.post("/create", authenticateJWT, createClass);

router.get("/students/:classId", async (req, res) => {
  const { classId } = req.params;
  try {
    const students = await getStudentsWithAttendance(classId);
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving students." });
  }
});

//over all Attendance
router.get("/allAttendance/:classId", async (req, res) => {
  const { classId } = req.params;
  try {
    const data = await getClassAllAttendance(classId);
    if(!data){
      return res.status(400).json({
        message: "No Data Found!"
      })
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving attendance." });
  }
});

router.get('/getAll',authenticateJWT, getAllCalsses);

module.exports = router;
