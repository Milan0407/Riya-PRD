const Subscription = require("../models/Subscription");
const Charity = require("../models/Charity");

// 💰 Calculate pool
const calculatePool = async (month, year) => {
  // get active subscriptions
  const subs = await Subscription.find({ status: "active" });

  const totalUsers = subs.length;

  // 👉 define pricing (can move to config later)
  const monthlyPrice = 100;

  const totalCollection = totalUsers * monthlyPrice;

  // ❤️ charity 10%
  const charityAmount = totalCollection * 0.1;

  // 🎯 prize pool
  const prizePool = totalCollection - charityAmount;

  return {
    totalUsers,
    totalCollection,
    charityAmount,
    prizePool,
  };
};

// ❤️ Store charity
const saveCharity = async (drawId, charityAmount) => {
  return await Charity.create({
    drawId,
    amount: charityAmount,
    percentage: 10,
  });
};

module.exports = {
  calculatePool,
  saveCharity,
};