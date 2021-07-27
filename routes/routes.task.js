const express = require("express");
const TaskController = require("../controller/controller.task");
const { verify } = require("../auth/auth");

const taskRoutes = express.Router();

// taskRoutes.get("/", verify, (req, res) => TaskController.getAllTasks(req, res));
// taskRoutes.post("/add", (req, res) => TaskController.createTask(req, res));
// taskRoutes.get("/project/all/:id", verify, (req, res) => TaskController.getAllTaskByProjectId(req, res));
// taskRoutes.get("/user", (req, res) => TaskController.getTaskByUserId(req, res));
// taskRoutes.get("/subtask/:id", verify, (req, res) => TaskController.getSubtask(req, res));
// taskRoutes.get("/project/:id", verify, (req, res) => TaskController.getDirectTaskByProjectId(req, res));
// taskRoutes.put("/update:id", verify, (req, res) => TaskController.updateTask(req, res));
// taskRoutes.get("/calculate/:id", verify, (req, res) => ProjectController.computeTaskProgress(req, res));
// taskRoutes.get("/:id", verify, (req, res) => TaskController.getTask(req, res));


//debug
taskRoutes.get("/", (req, res) => TaskController.getAllTasks(req, res));
taskRoutes.post("/add", (req, res) => TaskController.createTask(req, res));
taskRoutes.get("/user", (req, res) => TaskController.getTaskByUserId(req, res));
taskRoutes.get("/subtask/:id", (req, res) => TaskController.getSubtask(req, res));
taskRoutes.get("/project/:id", (req, res) => TaskController.getDirectTaskByProjectId(req, res));
taskRoutes.get("/project/all/:id", (req, res) => TaskController.getAllTaskByProjectId(req, res));
taskRoutes.put("/update/:id", (req, res) => TaskController.updateTask(req, res));
taskRoutes.put("/computeProgress/", (req, res) => TaskController.computeProgress(req, res));
taskRoutes.get("/calculate/:id", (req, res) => TaskController.computeTaskProgress(req, res));
taskRoutes.get("/:id", (req, res) => TaskController.getTask(req, res));

module.exports = taskRoutes;