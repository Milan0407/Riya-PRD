const Score = require("../models/Score");
const { createEntryIfEligible } = require("../services/entryService");

// ➕ Add Score
exports.addScore = async (req, res) => {
  try {
    const userId = req.user._id;
    const { value } = req.body;

    if (!value || value < 1 || value > 45) {
      return res.status(400).json({
        message: "Score must be between 1 and 45",
      });
    }

    let scoreDoc = await Score.findOne({ userId });

    if (!scoreDoc) {
      scoreDoc = await Score.create({
        userId,
        scores: [{ value }],
      });
    } else {
      scoreDoc.scores.push({ value });

      if (scoreDoc.scores.length > 5) {
        scoreDoc.scores.shift();
      }

      await scoreDoc.save();
    }

    // ✅ 🔥 AUTO CREATE ENTRY
    await createEntryIfEligible(userId, scoreDoc.scores);

    res.json({
      message: "Score added",
      scores: scoreDoc.scores.slice().reverse(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 📥 Get Scores (latest first)
exports.getScores = async (req, res) => {
  try {
    const userId = req.user._id;

    const scoreDoc = await Score.findOne({ userId });

    if (!scoreDoc) {
      return res.json({ scores: [] });
    }

    res.json({
      scores: scoreDoc.scores
        .slice()
        .reverse(), // reverse chronological
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};