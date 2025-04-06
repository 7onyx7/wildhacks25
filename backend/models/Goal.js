const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Optional: link to a User model if one exists
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  targetAmount: {
    type: Number,
    required: true,
  },
  currentAmount: {
    type: Number,
    default: 0,
  },
  progress: {
    type: Number,
    default: 0, // will be auto-calculated
  },
  status: {
    type: String,
    enum: ["in-progress", "completed"],
    default: "in-progress",
  },
  targetDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-calculate progress and status before saving
goalSchema.pre("save", function (next) {
  this.progress = this.currentAmount / this.targetAmount;
  this.status = this.currentAmount >= this.targetAmount ? "completed" : "in-progress";
  this.updatedAt = new Date();
  next();
});

// Optional: recalculate progress/status on update
goalSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.currentAmount !== undefined || update.targetAmount !== undefined) {
    this.findOne().then((doc) => {
      const newCurrent = update.currentAmount ?? doc.currentAmount;
      const newTarget = update.targetAmount ?? doc.targetAmount;
      update.progress = newCurrent / newTarget;
      update.status = newCurrent >= newTarget ? "completed" : "in-progress";
      update.updatedAt = new Date();
      this.setUpdate(update);
      next();
    });
  } else {
    next();
  }
});

module.exports = mongoose.model("Goal", goalSchema);
