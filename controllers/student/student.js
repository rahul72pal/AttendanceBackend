const Student = require("../../models/student/studentModal");
const StudentClassMap = require("../../models/student/studentClassMap");

const createStudent = async (req, res) => {
  try {
    const { name, class_id } = req.body;

    if (!name || !class_id) {
      return res.status(400).json({ error: "Name and class ID are required" });
    }

    // Step 1: Check if the student already exists
    let student = await Student.findOne({ name });
    if (!student) {
      // If student does not exist, create a new student document
      student = new Student({ name });
      await student.save();
    }

    // Step 2: Check for duplicate enrollment in StudentClassMap
    const existingEnrollment = await StudentClassMap.findOne({
      student_id: student._id,
      class_id: class_id,
    });

    if (existingEnrollment) {
      return res
        .status(409)
        .json({ error: "Student is already enrolled in this class" });
    }

    // Step 3: If no duplicate, create a new enrollment entry in StudentClassMap
    const studentClassMap = new StudentClassMap({
      student_id: student._id,
      class_id: class_id,
    });

    await studentClassMap.save();

    return res.status(201).json({
      message: "Student enrolled successfully",
      student,
      studentClassMap,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllStudentByClassInOrder = async (class_id) => {
  try {
    const students = await StudentClassMap.find({ class_id: class_id })
      .populate({
        path: "student_id",
        select: "name roll_number",
      })
      .sort({ "student_id.roll_number": 1 });

    // Extract and format the student details from the populated data
    const studentDetails = students.map((entry) => ({
      id: entry.student_id._id,
      name: entry.student_id.name,
      roll_number: entry.student_id.roll_number,
    }));

    return studentDetails;
  } catch (error) {
    console.error("Error retrieving students by class:", error);
    throw error;
  }
};

module.exports = {
  createStudent,
  getAllStudentByClassInOrder,
};
