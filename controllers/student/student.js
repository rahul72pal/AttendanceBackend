const Student = require("../../models/student/studentModal");
const StudentClassMap = require("../../models/student/studentClassMap");
const { ObjectId } = require("mongodb");

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
      data: {
        name: student.name,
        roll_number: student.roll_number,
        class_id: class_id,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllStudentByClassInOrder = async (class_id) => {
  try {
    const studentsData = await StudentClassMap.aggregate([
      { $match: { class_id: new ObjectId(class_id) } },
      {
        $lookup: {
          from: "students",
          localField: "student_id",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      { $unwind: "$studentDetails" },
      {
        $project: {
          "studentDetails._id": 1,
          "studentDetails.name": 1,
          "studentDetails.roll_number": 1,
        },
      },
      { $sort: { "studentDetails.roll_number": 1 } },
    ]);

    // Extract and format the student details from the populated data
    const students = studentsData.map((entry) => ({
      id: entry.studentDetails._id,
      name: entry.studentDetails.name,
      roll_number: entry.studentDetails.roll_number,
    }));

    return students;
  } catch (error) {
    console.error("Error retrieving students by class:", error);
    throw error;
  }
};

// const getAllStudentByClassId = async(class_id)=>{
//   try {
//     const student = await
//   } catch (error) {

//   }
// }

module.exports = {
  createStudent,
  getAllStudentByClassInOrder,
};
