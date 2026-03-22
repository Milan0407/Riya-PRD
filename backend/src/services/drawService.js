const Winner = require("../models/Winner");

// 🎯 Count matches
const countMatches = (arr1, arr2) => {
  return arr1.filter((num) => arr2.includes(num)).length;
};

// 🏆 Main Logic
const calculateWinners = async (draw, entries) => {
  const winningNumbers = draw.winningNumbers;
  const totalPool = draw.totalPool;

  // 💰 Prize splits
  let prizePool = {
    match5: totalPool * 0.4,
    match4: totalPool * 0.35,
    match3: totalPool * 0.25,
  };

  // 👥 Categorize winners
  const winners = {
    match5: [],
    match4: [],
    match3: [],
  };

  // 🔍 Check each entry
  for (let entry of entries) {
    const matchCount = countMatches(entry.numbers, winningNumbers);

    if (matchCount === 5) winners.match5.push(entry);
    else if (matchCount === 4) winners.match4.push(entry);
    else if (matchCount === 3) winners.match3.push(entry);
  }

  // 🔁 Handle rollover
  let rollover = 0;

  if (winners.match5.length === 0) {
    rollover += prizePool.match5;
    prizePool.match5 = 0;
  }

  if (winners.match4.length === 0) {
    rollover += prizePool.match4;
    prizePool.match4 = 0;
  }

  if (winners.match3.length === 0) {
    rollover += prizePool.match3;
    prizePool.match3 = 0;
  }

  // 💵 Distribute prizes equally per category
  const distribute = (pool, winnerList) => {
    if (winnerList.length === 0) return [];
    const prizeEach = pool / winnerList.length;

    return winnerList.map((entry) => ({
      userId: entry.userId,
      drawId: draw._id,
      position:
        winnerList === winners.match5
          ? 1
          : winnerList === winners.match4
          ? 2
          : 3,
      prize: prizeEach,
    }));
  };

  const finalWinners = [
    ...distribute(prizePool.match5, winners.match5),
    ...distribute(prizePool.match4, winners.match4),
    ...distribute(prizePool.match3, winners.match3),
  ];

  // 💾 Save winners in DB
  if (finalWinners.length > 0) {
    await Winner.insertMany(finalWinners);
  }

  return {
    winners: finalWinners,
    prizeDistribution: prizePool,
    rolloverAmount: rollover,
  };
};

module.exports = calculateWinners;