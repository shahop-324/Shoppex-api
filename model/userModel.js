const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;