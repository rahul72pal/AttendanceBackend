const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now()
  },
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  attendance_data: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
