const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

function connectionDB() {
    mongoose.connect(`${process.env.MONGO_DB_URL}/attendance`, {
    })
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch((err) => {
        console.log(`Connection Error: ${err}`);
    });
}

module.exports = connectionDB;
