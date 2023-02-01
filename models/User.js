const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    profilePic: {
      type: String,
      default: null,
      unique: false,
    },

    userRole: {
      type: String,
      required: true,
    },
    confirmToken: {
      type: String,
      unique: true,
    },
    confirmAccount: {
      type: Boolean,
      default: null,
      unique: false,
    },
    resetToken: {
      type: String,
      default: null,
      unique: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
