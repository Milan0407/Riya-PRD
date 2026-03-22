const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ✅ CORS CONFIG (IMPORTANT)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://golf-backend-eight.vercel.app/api" // 🔥 your frontend URL
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/subscription", require("./routes/subscriptionRoutes"));
app.use("/api/scores", require("./routes/scoreRoutes"));
app.use("/api/draw", require("./routes/drawRoutes"));
app.use("/api/entry", require("./routes/entryRoutes"));
app.use("/api/winner", require("./routes/winnerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health check route (VERY IMPORTANT FOR RENDER)
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Error Middleware
app.use(errorHandler);

module.exports = app;