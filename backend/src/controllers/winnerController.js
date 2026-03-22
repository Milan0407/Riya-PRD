const Winner = require("../models/Winner");

// 📥 Get my winnings
exports.getMyWinnings = async (req, res) => {
  try {
    const winners = await Winner.find({ userId: req.user._id });

    res.json(winners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📤 Upload proof (simulate)
exports.submitProof = async (req, res) => {
  try {
    const { winnerId, proof } = req.body;

    const winner = await Winner.findById(winnerId);

    if (!winner) {
      return res.status(404).json({ message: "Winner not found" });
    }

    // ensure user owns this
    if (winner.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    winner.proof = proof;
    await winner.save();

    res.json({ message: "Proof submitted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Admin verify winner
exports.verifyWinner = async (req, res) => {
  try {
    const { winnerId } = req.body;

    const winner = await Winner.findById(winnerId);

    if (!winner) {
      return res.status(404).json({ message: "Winner not found" });
    }

    winner.verified = true;
    await winner.save();

    res.json({ message: "Winner verified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 💰 Mark payout as paid
exports.markPaid = async (req, res) => {
  try {
    const { winnerId } = req.body;

    const winner = await Winner.findById(winnerId);

    if (!winner) {
      return res.status(404).json({ message: "Winner not found" });
    }

    if (!winner.verified) {
      return res.status(400).json({
        message: "Winner must be verified first",
      });
    }

    winner.payoutStatus = "paid";
    await winner.save();

    res.json({ message: "Payout marked as paid" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};