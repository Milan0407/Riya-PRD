const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  runDraw,
  getResults,
} = require("../controllers/drawController");

// 🎲 Run draw (admin only)
router.post("/run", auth, admin, runDraw);

// 📥 Get results
router.get("/", auth, getResults);

module.exports = router;