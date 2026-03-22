const Subscription = require("../models/Subscription");

// 🧮 Helper: calculate renewal date
const getRenewalDate = (plan) => {
  const now = new Date();
  if (plan === "monthly") {
    now.setMonth(now.getMonth() + 1);
  } else {
    now.setFullYear(now.getFullYear() + 1);
  }
  return now;
};

// ✅ Subscribe (simulate payment success)
exports.subscribe = async (req, res) => {
  try {
    const userId = req.user._id;
    const { plan } = req.body;

    if (!["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    // deactivate old subscription
    await Subscription.updateMany(
      { userId, status: "active" },
      { status: "inactive" }
    );

    // create new subscription
    const newSub = await Subscription.create({
      userId,
      plan,
      status: "active",
      renewalDate: getRenewalDate(plan),
    });

    res.json({
      message: "Subscription activated",
      subscription: newSub,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user._id;

    const sub = await Subscription.findOne({
      userId,
      status: "active",
    });

    if (!sub) {
      return res.status(404).json({ message: "No active subscription" });
    }

    sub.status = "inactive";
    await sub.save();

    res.json({ message: "Subscription cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Check subscription status
exports.getMySubscription = async (req, res) => {
  try {
    const userId = req.user._id;

    const sub = await Subscription.findOne({
      userId,
      status: "active",
    });

    if (!sub) {
      return res.json({ active: false });
    }

    // check expiry
    if (new Date() > sub.renewalDate) {
      sub.status = "inactive";
      await sub.save();
      return res.json({ active: false });
    }

    res.json({
      active: true,
      plan: sub.plan,
      renewalDate: sub.renewalDate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};