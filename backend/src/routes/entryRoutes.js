const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Entry = require("../models/Entry");

// 📥 Get my entry
router.get("/me", auth, async (req, res) => {
  const now = new Date();

  const entry = await Entry.findOne({
    userId: req.user._id,
    drawMonth: now.getMonth() + 1,
    drawYear: now.getFullYear(),
  });

  res.json(entry || null);
});

module.exports = router;