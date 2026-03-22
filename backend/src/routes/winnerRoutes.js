const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  getMyWinnings,
  submitProof,
  verifyWinner,
  markPaid,
} = require("../controllers/winnerController");

// 👤 user
router.get("/me", auth, getMyWinnings);
router.post("/proof", auth, submitProof);

// 🔑 admin
router.post("/verify", auth, admin, verifyWinner);
router.post("/pay", auth, admin, markPaid);

module.exports = router;