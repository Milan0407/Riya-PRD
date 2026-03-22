const Subscription = require("../models/Subscription");

const checkSubscription = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const sub = await Subscription.findOne({
      userId,
      status: "active",
    });

    if (!sub) {
      return res.status(403).json({
        message: "Active subscription required",
      });
    }

    // check expiry
    if (new Date() > sub.renewalDate) {
      sub.status = "inactive";
      await sub.save();

      return res.status(403).json({
        message: "Subscription expired",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = checkSubscription;