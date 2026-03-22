const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
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

// Error Middleware
app.use(errorHandler);

module.exports = app;