const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    roll_number: {
      type: Number,
      unique: true,
      sparse: true, // Allows MongoDB to skip nulls in unique constraint
    },
  },
  {
    timestamps: true,
  }
);

// Apply auto-increment to roll_number
studentSchema.plugin(AutoIncrement, { inc_field: "roll_number" });

module.exports = mongoose.model("Student", studentSchema);
