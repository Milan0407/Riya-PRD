const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    drawMonth: Number,
    drawYear: Number,

    numbers: {
      type: [Number], // exactly 5 numbers
      validate: [(arr) => arr.length === 5, "Must have 5 numbers"],
    },

    matchedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 🚫 prevent duplicate entry per user per month
entrySchema.index({ userId: 1, drawMonth: 1, drawYear: 1 }, { unique: true });

module.exports = mongoose.model("Entry", entrySchema);