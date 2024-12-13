const teacherSchema = require("../../models/user/teacherSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();

const registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email is already registered
    const existingTeacher = await teacherSchema.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Hash the password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new teacher instance
    const newTeacher = new teacherSchema({
      name,
      email,
      password,
    });

    // Save the teacher to the database
    await newTeacher.save();

    // Generate a JWT token
    const token = jwt.sign(
      { id: newTeacher._id, email: newTeacher.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token in HTTP-only cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 3600000,
    });

    res.status(201).json({
      message: "Teacher registered successfully!",
      token,
      teacher: {
        id: newTeacher._id,
        name: newTeacher.name,
        email: newTeacher.email,
      },
    });
  } catch (error) {
    console.error("Error registering teacher:", error);
    res.status(500).json({ message: "Error registering teacher", error });
  }
};

async function getTeacherDetails(id, email) {
  return teacherSchema.findOne({ _id: id, email: email })
    .select('name email')
    .exec()
    .then((teacher) => {
      if (!teacher) {
        throw new Error('Teacher not found');
      }
      return teacher;
    })
    .catch((error) => {
      console.error('Error getting teacher details:', error);
      throw error;
    });
}

module.exports = {
  registerTeacher,
  getTeacherDetails
};
