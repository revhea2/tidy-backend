const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const historySchema = new Schema(
  {
    userList: [
      {
        type: String,
      },
    ],
    remarks: {
      type: String,
    },
    updateDate: {
      type: Date,
      required: true
    },
    timeline: {
      type: String,
    },
  },
  { timestaps: true }
);

const History = mongoose.model("History", historySchema);
module.exports = History;
