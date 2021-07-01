const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timelimeSchema = new Schema(
  {
   startDate: {
    type: Date,
    required: true,
   },
   endDate: {
    type: Date,
    required: true,
   },
   progress: {
    type: Number
   },
},
  { timestaps: true }
);

const Timeline = mongoose.model("Timeline", timelimeSchema);
module.exports = Timeline;
