const Entry = require("../models/Entry");

// 📅 get current month/year
const getCurrentDraw = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

// 🎯 Create entry if eligible
const createEntryIfEligible = async (userId, scores) => {
  try {
    // must have exactly 5 scores
    if (!scores || scores.length !== 5) return null;

    const { month, year } = getCurrentDraw();

    // check if entry already exists
    const existing = await Entry.findOne({
      userId,
      drawMonth: month,
      drawYear: year,
    });

    if (existing) return null;

    // extract only numbers
    const numbers = scores.map((s) => s.value);

    const entry = await Entry.create({
      userId,
      drawMonth: month,
      drawYear: year,
      numbers,
    });

    return entry;
  } catch (error) {
    console.error("Entry creation error:", error.message);
    return null;
  }
};

module.exports = {
  createEntryIfEligible,
};