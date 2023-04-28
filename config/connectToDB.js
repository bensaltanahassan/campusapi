const mongoose = require("mongoose");

const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`Connection to DB ${process.env.MONGO_URL} with success ...`);
  } catch (error) {
    console.log("Connection to db failed,", error);
  }
};

module.exports = connectToDB;
