const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// 👤 User route
router.get("/profile", auth, (req, res) => {
  res.json({
    message: "User profile",
    user: req.user,
  });
});

// 🔑 Admin-only route
router.get("/admin", auth, admin, (req, res) => {
  res.json({
    message: "Welcome Admin",
  });
});

module.exports = router;