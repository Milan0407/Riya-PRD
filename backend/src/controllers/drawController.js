const Draw = require("../models/Draw");
const Entry = require("../models/Entry");
const calculateWinners = require("../services/drawService");
const { calculatePool, saveCharity } = require("../services/poolService");

// 🎲 Generate 5 unique random numbers (1–45)
const generateNumbers = () => {
  const nums = new Set();

  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(nums);
};

// 🧮 Count matches
const countMatches = (arr1, arr2) => {
  return arr1.filter((num) => arr2.includes(num)).length;
};

// ✅ Run Draw
exports.runDraw = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // prevent duplicate draw
    const existing = await Draw.findOne({ month, year });
    if (existing) {
      return res.status(400).json({ message: "Draw already exists" });
    }

    // 💰 calculate pool
    const pool = await calculatePool(month, year);

    // 🎲 generate numbers
    const winningNumbers = generateNumbers();

    // create draw
    const draw = await Draw.create({
      month,
      year,
      winningNumbers,
      totalPool: pool.prizePool,
      charityAmount: pool.charityAmount,
      status: "pending",
    });

    // ❤️ store charity
    await saveCharity(draw._id, pool.charityAmount);

    // get entries
    const entries = await Entry.find({
      drawMonth: month,
      drawYear: year,
    });

    // 🏆 calculate winners
    const result = await calculateWinners(draw, entries);

    // update draw
    draw.results = result.winners;
    draw.rolloverAmount = result.rolloverAmount;
    draw.status = "completed";

    await draw.save();

    res.json({
      message: "Draw completed",
      winningNumbers,
      totalCollection: pool.totalCollection,
      charity: pool.charityAmount,
      prizePool: pool.prizePool,
      winners: result.winners,
      rollover: result.rolloverAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📥 Get Draw Results
exports.getResults = async (req, res) => {
  try {
    const draws = await Draw.find().sort({ createdAt: -1 });

    res.json(draws);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};