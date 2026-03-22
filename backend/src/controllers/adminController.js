const User = require("../models/User");
const Draw = require("../models/Draw");
const Winner = require("../models/Winner");

// 👥 Get all users
exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

// 🎲 Get all draws
exports.getDraws = async (req, res) => {
  const draws = await Draw.find().sort({ createdAt: -1 });
  res.json(draws);
};

// 🏆 Get all winners
exports.getWinners = async (req, res) => {
  const winners = await Winner.find()
    .populate("userId", "name email")
    .populate("drawId");

  res.json(winners);
};