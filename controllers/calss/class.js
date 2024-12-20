const attendanceModal = require('../../models/attendance/attendanceModal');
const Class = require('../../models/class/classModal')
const Teacher = require('../../models/user/teacherSchema');
const { getAllStudentByClassInOrder } = require('../student/student');
const { ObjectId } = require("mongodb");

const createClass = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Create a new class
    const newClass = new Class({ name });
    await newClass.save();

    // Update the teacher's classes
    const teacher = await Teacher.findById(userId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Push the new class ID into the teacher's classes array
    teacher.classes.push(newClass._id);
    await teacher.save(); // Save the updated teacher document

    return res.status(201).json(newClass);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllCalsses = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the teacher and populate the 'classes' field with full Class documents
    const teacher = await Teacher.findById(userId).populate('classes');

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if the teacher has any classes
    if (!teacher.classes || teacher.classes.length === 0) {
      return res.status(404).json({ message: "No Class Found" });
    }

    // Return the full class documents
    return res.status(200).json({ classes: teacher.classes });
  } catch (error) {
    console.error(error); // Use console.error for better error logging
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getClassAllAttendance = async(class_id)=>{
  try {
    if(!class_id){
      return "Class Id Required"
    }
    const students = await getAllStudentByClassInOrder(class_id);

    if(!students){
      return "No Student Found"
    }

    const attendance = await attendanceModal.find({class_id: new ObjectId(class_id)}).select("attendance_data date");

    if(!attendance){
      return "No Attendance Found"
    }

    const data = {
      students: students,
      attendance: attendance
    }

    return data;

  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports ={
    createClass,
    getAllCalsses,
    getClassAllAttendance
}
