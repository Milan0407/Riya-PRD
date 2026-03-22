const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  getUsers,
  getDraws,
  getWinners,
} = require("../controllers/adminController");

router.get("/users", auth, admin, getUsers);
router.get("/draws", auth, admin, getDraws);
router.get("/winners", auth, admin, getWinners);

module.exports = router;