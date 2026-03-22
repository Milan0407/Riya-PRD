const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    drawId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Draw",
    },
    position: {
      type: Number, // 1,2,3
    },
    prize: Number,

    // ✅ NEW FIELDS
    verified: {
      type: Boolean,
      default: false,
    },
    proof: {
      type: String, // URL or file path
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Winner", winnerSchema);