const express = require("express");
const {ProjectController} = require("../controller/controller.project");
const { verify } = require("../auth/auth");

const projectRoutes = express.Router();

// projectRoutes.get("/", verify, (req, res) => ProjectController.getAllProjects(req, res));
// projectRoutes.post("/add", verify, (req, res) => ProjectController.createProject(req, res));
// projectRoutes.get("/user", verify, (req, res) => ProjectController.getProjectByUserId(req, res));
// projectRoutes.put("/update", verify, (req, res) => ProjectController.updateProject(req, res));
// projectRoutes.get("/:id", verify,  (req, res) => ProjectController.getProject(req, res));


// debug
projectRoutes.get("/", (req, res) => ProjectController.getAllProjects(req, res));
projectRoutes.post("/add", (req, res) => ProjectController.createProject(req, res));
projectRoutes.get("/user", (req, res) => ProjectController.getProjectByUserId(req, res));
projectRoutes.put("/update", (req, res) => ProjectController.updateProject(req, res));
projectRoutes.get("/:id", (req, res) => ProjectController.getProject(req, res));

module.exports = projectRoutes;
