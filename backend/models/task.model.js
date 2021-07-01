const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    projectID: {
      type: String,
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
        type: String,
      }
    ],
    timeline: {
      type: String,
    },
    taskHistory: [
      {
        type: String,
      },
    ],
    taskOwner: [
      {
        type: String,
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
