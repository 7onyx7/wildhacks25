const mongoose = require("mongoose");

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  });
  console.log("✅ MongoDB connected");
};

const close = async () => {
  await mongoose.connection.close();
};

module.exports = {
  connect,
  close,
};
