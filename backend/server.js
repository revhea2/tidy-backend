const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

/**
 * All routes
 */
const userRoutes = require("./routes/routes.user")
const timelineRoutes = require("./routes/routes.timeline")
const historyRoutes = require("./routes/routes.history")
const projectRoutes = require("./routes/routes.project")
const taskRoutes = require("./routes/routes.task")


app.use("/user", userRoutes)
app.use("/timeline", timelineRoutes)
app.use("/history", historyRoutes)
app.use("/project", projectRoutes)
app.use("/task", taskRoutes)



app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
