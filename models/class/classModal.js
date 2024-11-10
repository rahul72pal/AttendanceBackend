const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  }
});

module.exports = mongoose.model('Class', classSchema);
