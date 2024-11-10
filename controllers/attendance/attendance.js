const { getAllStudentByClassInOrder } = require("../student/student");
const Attendance = require("../../models/attendance/attendanceModal");

const saveAttendance = async (req, res) => {
  try {
    // Destructure the data from the request
    const { date, class_id, attendance_data } = req.body;

    // Normalize the date to year-month-day
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to zero

    // Retrieve students sorted by roll_number and create a bit array
    const students = await getAllStudentByClassInOrder(class_id);
    let attendanceBitArray = Array(students.length).fill("0");

    // Map roll numbers to indices for efficient marking
    const rollNumberToIndexMap = Object.fromEntries(
      students.map((student, index) => [student.roll_number, index])
    );

    // Mark the presence in attendanceBitArray based on `attendance_data`
    attendance_data.forEach((student) => {
      const index = rollNumberToIndexMap[student.roll_number];
      if (index !== undefined) {
        attendanceBitArray[index] = "1";
      }
    });

    // Convert new attendance bit array to a string
    const newAttendanceString = attendanceBitArray.join("");

    // Find and update existing attendance data or create a new record
    const existingAttendance = await Attendance.findOne({
      date: normalizedDate,
      class_id: class_id,
    });

    // Merge with existing data if it exists
    const mergedAttendanceString = existingAttendance
      ? existingAttendance.attendance_data
          .split("")
          .map((bit, idx) =>
            bit === "1" || newAttendanceString[idx] === "1" ? "1" : "0"
          )
          .join("")
      : newAttendanceString;

    // Save the merged result
    await Attendance.findOneAndUpdate(
      { date: normalizedDate, class_id: class_id },
      { $set: { attendance_data: mergedAttendanceString } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Attendance saved/updated successfully" });
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ message: "Failed to save attendance", error });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { date, class_id } = req.body;

    // Retrieve students for the given class, ordered by roll_number
    const students = await getAllStudentByClassInOrder(class_id);

    // Retrieve the attendance record for the given date and class_id
    const attendanceRecord = await Attendance.findOne({
      date: new Date(date),
      class_id: class_id,
    });

    if (!attendanceRecord) {
      return res.status(404).json({
        message: "Attendance not found for the specified date and class",
      });
    }

    // Decode the attendance string into an array of 0s and 1s
    const attendanceBitArray = attendanceRecord.attendance_data.split("");

    // Map students to their attendance status
    const studentResult = students.map((student, index) => {
      return {
        student_id: student._id,
        name: student.name,
        roll_number: student.roll_number,
        present: attendanceBitArray[index] === "1", // Check if attendance is marked as '1' (present)
      };
    });

    res.status(200).json({ attendance: studentResult });
  } catch (error) {
    console.error("Error retrieving attendance:", error);
    res.status(500).json({ message: "Failed to retrieve attendance", error });
  }
};

const getStudentAttendance = async (req, res) => {
  try {
    // Destructure class_id and student_id from the request body
    const { class_id, student_id } = req.body;

    // Retrieve students for that class, ordered by roll number
    const students = await getAllStudentByClassInOrder(class_id);

    // Find the student index in the student list once
    const studentIndex = students.findIndex(
      (student) => student.id.toString() === student_id
    );

    if (studentIndex === -1) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get all attendance records for the specified class, limiting data retrieval
    const attendanceRecords = await Attendance.find({ class_id: class_id })
      .select("date attendance_data") // Only select necessary fields
      .lean(); // Convert MongoDB docs to plain JavaScript objects

    // Optimize attendance lookup: directly access the student status in the attendance string
    const studentAttendance = attendanceRecords.map((record) => {
      const present = record.attendance_data[studentIndex] === "1"; // Access bit directly
      return {
        date: record.date,
        present: present,
      };
    });

    // Return the student's attendance result
    res.status(200).json({ student_id, attendance: studentAttendance });
  } catch (error) {
    console.error("Error retrieving student attendance:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve student attendance", error });
  }
};

module.exports = {
  saveAttendance,
  getAttendance,
  getStudentAttendance,
};
