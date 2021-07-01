const express = require("express");
const ProjectController = require("../controller/controller.project");

const projectRoutes = express.Router();

projectRoutes.get("/", (req, res) => ProjectController.getAllProjects(req, res));
projectRoutes.post("/add", (req, res) => ProjectController.createProject(req, res));
projectRoutes.get("/:id", (req, res) => ProjectController.getProject(req, res));
projectRoutes.get("/user/:id", (req, res) => ProjectController.getProjectByUserId(req, res));

module.exports = projectRoutes;
