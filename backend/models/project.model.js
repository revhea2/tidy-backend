const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    // projectID: {
    //   type: String,
    //   required: true,
    // },
    projectName: {
      type: String,
      required: true,
    },
    projectOwner: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      },
    ],
    projectHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "History"
      },
    ],
    timeline: {
      type: Schema.Types.ObjectId,
      ref: "Timeline"
    },
    projectDetails: {
      type: String,
    },
    task: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task"
      },
    ],
  },
  { timestaps: true }
);

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
