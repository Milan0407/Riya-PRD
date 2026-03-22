const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  subscribe,
  cancelSubscription,
  getMySubscription,
} = require("../controllers/subscriptionController");

// Subscribe
router.post("/subscribe", auth, subscribe);

// Cancel subscription
router.post("/cancel", auth, cancelSubscription);

// Get my subscription
router.get("/me", auth, getMySubscription);

module.exports = router;