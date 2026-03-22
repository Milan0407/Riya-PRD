const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const checkSubscription = require("../middleware/Subscription");

const {
  addScore,
  getScores,
} = require("../controllers/scoreController");

// ➕ Add score (protected + subscription required)
router.post("/", auth, checkSubscription, addScore);

// 📥 Get scores
router.get("/", auth, getScores);

module.exports = router;