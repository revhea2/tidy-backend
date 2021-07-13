const express = require("express");
const Project = require("../models/project.model");
const Task = require("../models/task.model");
const { decode } = require("../auth/auth.js");
const { _createTimeline } = require("./controller.timeline");
const { _createHistory } = require("./controller.history");
const Node = require("../utils/util.node");

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
      .populate("projectOwner", [
        "badgeID",
        "firstName",
        "lastName",
        "jobTitle",
        "additionalInfo",
        "emailAddress",
      ])
      .populate("task")
      .sort({ createdAt: -1 })
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
    const userID = decode(req.headers.authorization).id;

    const project = req.body;
    const projectOwner = [userID, ...project.projectOwner];
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
      .then(async (project) => {
        const [isSuccesful, message] = await _getProject(project._id);

        return isSuccesful
          ? res.status(201).json(message)
          : res.status(400).json(message);
      })
      .catch((err) => res.status(400).json("Error" + err));
  },

  /**
   * gets all tasks that is managed by a user by ID from the token
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns All tasks owned by the user
   */
  getProjectByUserId: (req, res) => {
    const userID = decode(req.headers.authorization).id;

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
      .populate("projectOwner", [
        "badgeID",
        "firstName",
        "lastName",
        "jobTitle",
        "additionalInfo",
        "emailAddress",
      ])
      .populate("task")
      .sort({ createdAt: -1 })
      .exec(function (err, results) {
        if (err) {
          res.status(400).json({ error: "Error in getting all projects." });
        }
        res.status(200).json(results);
      });
  },

  updateProject: async (req, res) => {
    const [isSuccesful, message] = await _updateProject(req.body);
    return isSuccesful
      ? res.status(201).json(message)
      : res.status(400).json(message);
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
      return res.status(400).json("Invalid route/mongoose ID!");
    }

    const [isSuccesful, message] = await _getProject(req.params.id);

    return isSuccesful
      ? res.status(201).json(message)
      : res.status(400).json(message);
  },

  /**
   * computes the current total progress of a project
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns total progress of project
   */
  computeProjectProgress: async (req, res) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json("Invalid route/mongoose ID!");
    }

    const [isSuccesful, result] = await _getProject(req.params.id);

    if (isSuccesful) {
      const directTasks = result.task;
      const tree = await _createTree(directTasks);

      // _bfs(tree);
      console.log(_dfs(tree));
    }
    return res.status(200).json("No error!");
  },
};

const _bfs = (tree) => {
  var queue = [tree];

  while (queue.length > 0) {
    var n = queue.length;
    while (n > 0) {
      const currentNode = queue.shift();
      console.log(currentNode.name);
      console.log(currentNode.children);
      console.log("");
      queue = queue.concat(currentNode.children);
      n--;
    }
  }
};

const _dfs = (node) => {
  var total_progress = 0;
  var total_weight = 0;

  if (node.children.length == 0) {
    return node.progress;
  } else {
    node.children.forEach((child) => {
      total_progress += child.weight * _dfs(child);
      total_weight += child.weight;
    });
  }
  return total_progress / total_weight;
};

const _createTree = async (directTasks) => {
  var parentNode = new Node(0, 0, "root");
  var stack = directTasks;
  while (stack.length > 0) {
    const task = stack.pop();
    const [isOkay, taskObj] = await _getTask(task._id);
    if (isOkay && taskObj) {
      var node = new Node(
        task.weight,
        taskObj.timeline.progress,
        taskObj.taskName
      );
      await _dfsInsert(node, taskObj);
      parentNode.addChild(node);
    }
  }

  return parentNode;
};

const _dfsInsert = async (node, task) => {
  var stack = task.task;
  while (stack.length > 0) {
    const subtask = stack.pop();
    const [isOkay, taskObj] = await _getTask(subtask._id);
    if (isOkay && taskObj) {
      var childNode = new Node(
        taskObj.weight,
        taskObj.timeline.progress,
        taskObj.taskName
      );
      await _dfsInsert(childNode, taskObj);
      node.addChild(childNode);
    }
  }
};

/**
 * gets a single task from db by ID
 *
 * @param {String.ID of Task object} id
 * @returns a single task
 */

const _getTask = (id) => {
  return Task.findById(id)
    .populate("task")
    .populate("timeline")
    .sort({ createdAt: -1 })
    .then((results) => {
      return [true, results];
    })
    .catch((err) => {
      return [false, { error: err }];
    });
};

const _updateProject = async (project) => {
  const [successful, oldProject] = await _getProject(project._id);
  let remarks = "";
  let tempProject = {};
  let history = {};

  if (project.projectOwner) {
    history["userList"] = oldProject.projectOwner;
    tempProject["projectOwner"] = project.projectOwner;
    remarks += "Project owner was altered. \n";
  }
  if (project.projectName) {
    tempProject["projectName"] = project.projectName;
    remarks += "Project name was altered. \n";
  }
  if (project.task) {
    history["task"] = oldProject.task;
    tempProject["task"] = project.task;
    remarks += "A task was added. \n";
  }
  if (project.timeline) {
    history["timeline"] = oldProject.timeline;
    const [isSuccessful, newTimeline] = await _createTimeline(project.timeline);
    tempProject["timeline"] = newTimeline._id;
    remarks += "Timeline was changed. \n";
  }
  if (project.projectDetails) {
    tempProject["projectDetails"] = project.projectDetails;
    remarks += "Project details was changed. \n";
  }

  history["remarks"] = remarks;

  const [isSuccesful, newHistory] = await _createHistory(history);

  if (isSuccesful) {
    tempProject["projectHistory"] = oldProject.projectHistory.concat(
      newHistory._id
    );
  } else {
    tempProject["projectHistory"] = oldProject.projectHistory;
  }

  const options = {
    new: true,
  };

  return Project.findByIdAndUpdate(project._id, tempProject, options)
    .then((project) => {
      return [true, project];
    })
    .catch((err) => {
      return [false, { err: err }];
    });
};

// all utility methods starts here

const _getProject = (id) => {
  return Project.findById(id)
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
    .populate("projectOwner", [
      "badgeID",
      "firstName",
      "lastName",
      "jobTitle",
      "additionalInfo",
      "emailAddress",
    ])
    .populate("task")
    .populate({
      path: "task",
      populate: {
        path: "timeline"
      }
    })
    .populate({
      path: "task",
      populate: {
        path: "taskOwner"
      }
    })
    .then((results) => {
      return [true, results];
    })
    .catch((err) => {
      return [false, { error: err }];
    });
};

module.exports.ProjectController = ProjectController;
module.exports._getProject = _getProject;
module.exports._updateProject = _updateProject;
