const mongoose = require("mongoose");

const drawSchema = new mongoose.Schema(
  {
    month: Number,
    year: Number,
    totalPool: Number,
    charityAmount: Number,

    winningNumbers: {
      type: [Number], // 5 numbers
      required: true,
    },

    results: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        matchCount: Number, // 3, 4, 5
      },
    ],

    rolloverAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Draw", drawSchema);
