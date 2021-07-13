const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const historySchema = new Schema(
  {
    userList: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
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
      type: Schema.Types.ObjectId,
      ref: "Timeline"
    },
  },
  { timestamps: true }
);

const History = mongoose.model("History", historySchema);
module.exports = History;
