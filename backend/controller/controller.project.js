const express = require("express");
const Project = require("../models/project.model");
const {
  _getProject,
  _getAllProject,
  _createHistory,
} = require("../utils/util.project");

const ProjectController = {
  /**
   * gets all projects from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns all projects in the database
   */

  getAllProjects: async (req, res) => {
    const project = await _getAllProject();
    return project !== null
      ? res.status(200).json(project)
      : res.status(400).json("Error in fetching all projects!");
  },

  /**
   * saves a project to the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   */

  createProject: (req, res) => {
    const projectName = req.body.projectName;
    const projectOwner = req.body.projectOwner;
    const projectHistory = req.body.projectHistory;
    const timeline = req.body.timeline;
    const task = req.body.task;
    const projectDetails = req.body.projectDetails;

    const newProject = new Project({
      projectName,
      projectOwner,
      projectHistory,
      timeline,
      projectDetails,
      task,
    });

    newProject
      .save()
      .then(() => res.json("Project added!"))
      .catch((err) => res.status(400).json("Error" + err));
  },

  /**
   * gets a project by ID from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns a single project from database
   */

  getProject: async (req, res) => {
    // check if the incoming id is valid mongoose id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.json("Invalid route/mongoose ID!");
    }

    let project = await _getProject(req.params.id);
    return project !== null
      ? res.status(200).json(project)
      : res.status(400).json("Error in getting a project!");
  },

  /**
   * gets all tasks that is managed by a user by ID
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns All tasks owned by the user
   */
  getProjectByUserId: (req, res) => {

    let userId = decode(request.headers.authorization).id

    return Project.find({ projectOwner: req.params.id })
      .then((projects) => res.json(projects))
      .catch((err) => res.status(400).json("Error" + err));
  },
};

module.exports = ProjectController;
