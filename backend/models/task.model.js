const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    taskName: {
      type: String,
      required: true,
    },
    parentTaskID: {
      type: String,
      default: null,
    },
    task: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task"
      },
    ],
    timeline:       {
      type: Schema.Types.ObjectId,
      ref: "Timeline"
    },
    taskHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "History"
      },
    ],
    taskOwner: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      },
    ],
    taskDetails: {
      type: String
    },
    weight: {
      type: Number,
    },
  },
  { timestaps: true }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
