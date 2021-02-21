const mongoose = require("mongoose");
require("dotenv").config();

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
