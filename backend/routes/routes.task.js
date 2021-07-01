const express = require("express");
const TaskController = require("../controller/controller.task");

const taskRoutes = express.Router();

taskRoutes.get("/", (req, res) => TaskController.getAllTasks(req, res));
taskRoutes.post("/add", (req, res) => TaskController.createTask(req, res));
taskRoutes.get("/:id", (req, res) => TaskController.getTask(req, res));
taskRoutes.get("/user/:id", (req, res) => TaskController.getTaskByUserId(req, res));
taskRoutes.get("/subtask/:id", (req, res) => TaskController.getSubtask(req, res));
taskRoutes.get("/project/:id", (req, res) => TaskController.getDirectTaskByProjectId(req, res));
taskRoutes.get("/project/all/:id", (req, res) => TaskController.getAllTaskByProjectId(req, res));
module.exports = taskRoutes;