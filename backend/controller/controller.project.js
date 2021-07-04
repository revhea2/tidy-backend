const express = require("express");
const Project = require("../models/project.model");
const { decode } = require("../auth/auth.js");
const { _createTimeline } = require("./controller.timeline");

const ProjectController = {
  /**
   * gets all projects from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns all projects in the database
   */

  getAllProjects: (req, res) => {
    return Project.find()
      .populate("timeline")
      .populate("projectHistory")
      .populate({
        path: "projectHistory",
        populate: {
          path: "userList",
        },
      })
      .populate({
        path: "projectHistory",
        populate: {
          path: "timeline",
        },
      })
      .populate("taskOwner", [
        "badgeID",
        "firstName",
        "lastName",
        "jobTitle",
        "additionalInfo",
        "emailAddress",
      ])
      .populate(task)
      .exec(function (err, results) {
        if (err) {
          res.status(400).json({ error: "Error in getting all histories." });
        }
        res.status(200).json(results);
      });
  },

  /**
   * saves a project to the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   */

  createProject: async (req, res) => {
    // const userID = decode(request.headers.authorization).id;
    // const projectOwner = [userID];

    const projectOwner = project.projectOwner;
    const project = req.body;
    const projectName = project.projectName;

    const projectHistory = project.projectHistory;
    const task = project.task;
    const projectDetails = project.projectDetails;
    const [isSuccessful, timeline] = await _createTimeline(project.timeline);

    const newProject = new Project({
      projectName,
      projectOwner,
      projectHistory,
      timeline: timeline._id,
      projectDetails,
      task,
    });

    return newProject
      .save()
      .then((project) => res.status(201).json(project))
      .catch((err) => res.status(400).json("Error" + err));
  },

  /**
   * gets a project by ID from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns a single project from database
   */

  getProject: (req, res) => {
    // check if the incoming id is valid mongoose id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json("Invalid route/mongoose ID!");
    }

    return Project.findByID(req.params.id)
      .populate("timeline")
      .populate("projectHistory")
      .populate({
        path: "projectHistory",
        populate: {
          path: "userList",
        },
      })
      .populate({
        path: "projectHistory",
        populate: {
          path: "timeline",
        },
      })
      .populate("taskOwner", [
        "badgeID",
        "firstName",
        "lastName",
        "jobTitle",
        "additionalInfo",
        "emailAddress",
      ])
      .populate(task)
      .exec(function (err, results) {
        if (err) {
          res.status(400).json({ error: "Error in getting all histories." });
        }
        res.status(200).json(results);
      });
  },

  /**
   * gets all tasks that is managed by a user by ID from the token
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns All tasks owned by the user
   */
  getProjectByUserId: (req, res) => {
    const userID = decode(request.headers.authorization).id;

    return Project.find({ projectOwner: userID })
      .populate("timeline")
      .populate("projectHistory")
      .populate({
        path: "projectHistory",
        populate: {
          path: "userList",
        },
      })
      .populate({
        path: "projectHistory",
        populate: {
          path: "timeline",
        },
      })
      .populate("taskOwner", [
        "badgeID",
        "firstName",
        "lastName",
        "jobTitle",
        "additionalInfo",
        "emailAddress",
      ])
      .populate(task)
      .exec(function (err, results) {
        if (err) {
          res.status(400).json({ error: "Error in getting all histories." });
        }
        res.status(200).json(results);
      });
  },
};

module.exports = ProjectController;
