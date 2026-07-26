const { default: mongoose } = require("mongoose");

require("dotenv").config();

async function db_connection() {
  try {
    const db = await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5mbf6b4.mongodb.net/dynamic_record?appName=Cluster0`,
    );
  } catch (err) {
    console.log(err);
  }
}

module.exports = db_connection;