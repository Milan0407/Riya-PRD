const mongoose = require("mongoose");

const charitySchema = new mongoose.Schema({
  drawId: { type: mongoose.Schema.Types.ObjectId, ref: "Draw" },
  amount: Number,
  percentage: Number,
}, { timestamps: true });

module.exports = mongoose.model("Charity", charitySchema);