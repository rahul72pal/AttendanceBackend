const express = require("express");
const { createClass, getAllCalsses } = require("../controllers/calss/class");
const { getAllStudentByClassInOrder } = require("../controllers/student/student");
const router = express.Router();

router.post("/create", createClass);

router.post("/students/:classId", async (req, res) => {
  const { classId } = req.params;
  try {
    const students = await getAllStudentByClassInOrder(classId);
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving students." });
  }
});

router.get('/getAll',getAllCalsses);

module.exports = router;
