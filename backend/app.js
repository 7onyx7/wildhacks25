require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get("/", (req, res) => {
  res.send("Gemmarize backend is up and running, CORS allowed.");
});

// Routes
const financialRoutes = require("./routes/financialRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const goalRoutes = require("./routes/goalRoutes");
const chatLogRoutes = require("./routes/chatLogRoutes");
const geminiRoutes = require("./routes/geminiRoutes");

app.use("/api", financialRoutes);
app.use("/api", budgetRoutes);
app.use("/api", transactionRoutes);
app.use("/api", analyticsRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/chatlogs", chatLogRoutes);
app.use("/api/gemini", geminiRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// MongoDB Connect + Server Start
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`🔗 Click to open: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
