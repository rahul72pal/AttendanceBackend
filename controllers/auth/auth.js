const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const userModal = require("../../models/user/userModal");
const bcrypt = require("bcrypt");
const teacherSchema = require("../../models/user/teacherSchema");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const { getTeacherDetails } = require("../user/user");
dotenv.config();

const loginUser = (req, res, next) => {
  passport.authenticate("local", { session: false }, async (err, user, info) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const teacher = await getTeacherDetails(user._id, user.email);

    // Set token in HTTP-only cookie
    res.cookie("access_token", token, {
      domain: "attendancebackend-goxz.onrender.com",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 7 * 24 * 3600000,
    });

    res.status(200).json({ token, teacher, message: "Login successful" });
  })(req, res, next);
};

module.exports = {
  loginUser,
};
