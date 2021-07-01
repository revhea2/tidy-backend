const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    badgeID: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 6,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 6,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    jobTitle: {
        type: String,
        required: true,
        trim: true,
    },
    emailAddress: {
        type: String,
        required: true,
        trim: true,
    },
    additionalInfo: {
        type: String,
    },
  },
  { timestaps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
