const { getAllStudentByClassInOrder } = require("../student/student");
const Attendance = require("../../models/attendance/attendanceModal");
const { getClassById } = require("../calss/class");
const { ObjectId } = require("mongodb");

const saveAttendance = async (req, res) => {
  try {
    // Destructure the data from the request
    const { date, class_id, attendance_data } = req.body;

    // Normalize the date to year-month-day
    // Convert date string from req.body to a Date object
    const parsedDate = new Date(date);

    // Normalize the date to UTC
    const normalizedDate = new Date(
      Date.UTC(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate()
      )
    );
    // Set hours, minutes, seconds, and milliseconds to zero

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

    //retrive the class
    // const classobj = await getClassById(class_id);

    // Retrieve the attendance record for the given date and class_id
    const queryDate = new Date(
      Date.UTC(
        new Date(date).getFullYear(),
        new Date(date).getMonth(),
        new Date(date).getDate()
      )
    );

    const attendanceRecord = await Attendance.findOne(
      { date: queryDate, class_id: class_id },
      "attendance_data"
    );

    if (!attendanceRecord) {
      return res.status(200).json({
        message: "Attendance not found for this Date",
      });
    }

    // Decode the attendance string into an array of booleans
    const attendanceBitArray = attendanceRecord.attendance_data
      .split("")
      .map((bit) => bit === "1");

    // Map students to their attendance status
    const studentResult = students.map((student, index) => ({
      student_id: student.id,
      name: student.name,
      roll_number: student.roll_number,
      present: attendanceBitArray[index] || false,
    }));

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
    let attendanceCount = 0;

    // Retrieve the student list for the class
    const students = await getAllStudentByClassInOrder(class_id);

    // Find the student index in the list
    const studentIndex = students.findIndex(
      (student) => student.id.toString() === student_id
    );

    if (studentIndex === -1) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Retrieve attendance records for the class
    const attendanceRecords = await Attendance.find({ class_id: class_id })
      .select("date attendance_data")
      .lean();

    // Process attendance data for the student
    const studentAttendance = attendanceRecords.map((record) => {
      const date = new Date(record.date);

      // Extract year, month, and day
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      // Format the date as YYYY-MM-DD
      const formattedDate = `${year}-${month}-${day}`;

      if (record.attendance_data[studentIndex] === "1") {
        attendanceCount++; // Increment the attendance count
      }

      return {
        date: formattedDate,
        count: record.attendance_data[studentIndex] === "1" ? 1 : 0,
      };
    });

    // Return the student's attendance result
    res
      .status(200)
      .json({
        student_id,
        attendance: studentAttendance,
        attendanceCount: attendanceCount,
      });
  } catch (error) {
    console.error("Error retrieving student attendance:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve student attendance", error });
  }
};

const getStudentsWithAttendance = async (class_id) => {
  try {
    // Fetch all attendance records for the class
    const attendanceRecords = await Attendance.find({
      class_id: new ObjectId(class_id),
    })
      .select("attendance_data")
      .lean();

    // Count the total number of attendance records
    const totalClasses = attendanceRecords.length;

    // If no attendance records exist, return students with 0% attendance
    if (totalClasses === 0) {
      const students = await getAllStudentByClassInOrder(class_id);
      return students.map((student) => ({
        ...student,
        attendance_percentage: 0,
      }));
    }

    // Fetch students for the class
    const students = await getAllStudentByClassInOrder(class_id);

    // Calculate attendance percentage for each student
    const studentAttendance = students.map((student, index) => {
      const presentCount = attendanceRecords.reduce((count, record) => {
        return record.attendance_data[index] === "1" ? count + 1 : count;
      }, 0);

      const attendancePercentage = Math.floor((presentCount / totalClasses) * 100);

      return {
        ...student,
        attendance_percentage: Number(attendancePercentage),
      };
    });

    return studentAttendance;
  } catch (error) {
    console.error("Error retrieving students with attendance:", error);
    throw error;
  }
};

module.exports = {
  saveAttendance,
  getAttendance,
  getStudentAttendance,
  getStudentsWithAttendance,
};
