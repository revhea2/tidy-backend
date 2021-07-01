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
        type: String,
      },
    ],
    projectHistory: [
      {
        type: String,
      },
    ],
    timeline: {
      type: String,
    },
    projectDetails: {
      type: String,
    },
    task: [
      {
        type: String,
      },
    ],
  },
  { timestaps: true }
);

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
