const express = require("express");
const Task = require("../models/task.model");
const { decode } = require("../auth/auth.js");
const { _createTimeline } = require("./controller.timeline");

const TaskController = {
  /**
   * gets all tasks from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns all tasks in the database
   */

  getAllTasks: (req, res) => {
    return Task.find()
      .populate("timeline")
      .populate("taskHistory")
      .populate({
        path: "taskHistory",
        populate: {
          path: "userList",
        },
      })
      .populate({
        path: "taskHistory",
        populate: {
          path: "timeline",
        },
      })
      .populate("task")
      .populate("taskOwner", [
        "badgeID",
        "firstName",
        "lastName",
        "jobTitle",
        "additionalInfo",
        "emailAddress",
      ])
      .exec(function (err, results) {
        if (err) {
          res.status(400).json({ error: "Error in getting all histories." });
        }
        res.status(200).json(results);
      });
  },

  /**
   * saves a task to the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   */

  createTask: async (req, res) => {
    const [isSuccesful, message] = await _createTask(req.body);
    return isSuccesful
      ? res.status(201).json(message)
      : res.status(400).json(message);
  },

  /**
   * gets a task by ID from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns a single task from database
   */

  getTask: (req, res) => {
    // check if the incoming id is valid mongoose id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json("Invalid route/mongoose ID!");
    }

    return Task.findById(req.params.id)
      .populate("timeline")
      .populate("taskHistory")
      .populate({
        path: "taskHistory",
        populate: {
          path: "userList",
        },
      })
      .populate({
        path: "taskHistory",
        populate: {
          path: "timeline",
        },
      })
      .populate(task)
      .populate("taskOwner", [
        "badgeID",
        "firstName",
        "lastName",
        "jobTitle",
        "additionalInfo",
        "emailAddress",
      ])
      .exec(function (err, results) {
        if (err) {
          res.status(400).json({ error: "Error in getting specific history." });
        }
        res.status(200).json(results);
      });
  },

  /**
   * gets all tasks that is managed by a user by ID
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns All tasks owned by the user
   */
  getTaskByUserId: (req, res) => {
    // check if the incoming id is valid mongoose id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.json([]);
    }
    const userID = decode(request.headers.authorization).id;

    return Task.findById(userID)
      .populate("timeline")
      .populate("taskHistory")
      .populate({
        path: "taskHistory",
        populate: {
          path: "userList",
        },
      })
      .populate({
        path: "taskHistory",
        populate: {
          path: "timeline",
        },
      })
      .populate(task)
      .populate("taskOwner", [
        "badgeID",
        "firstName",
        "lastName",
        "jobTitle",
        "additionalInfo",
        "emailAddress",
      ])
      .exec(function (err, results) {
        if (err) {
          res.status(400).json({ error: "Error in getting specific history." });
        }
        res.status(200).json(results);
      });
  },

  /**
   * gets all the subtasks by parentTaskID
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns All substasks of a specific task
   */

  getSubtask: (req, res) => {
    // check if the incoming id is valid mongoose id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.json([]);
    }

    return Task.findById(req.params.id)
      .then((task) => {
        Task.find({ _id: { $in: task.task } })
          .then((tasks) => res.json(tasks))
          .catch((err) => res.status(400).json("Error" + err));
      })
      .catch((err) => res.status(400).json("Error" + err));
  },

  /**
   * gets all tasks under a project
   * called by projectID
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns All the tasks under a project
   */

  getAllTaskByProjectId: (req, res) => {
    // check if the incoming id is valid mongoose id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.json([]);
    }
    return Task.find({ projectID: req.params.id })
      .then((tasks) => res.json(tasks))
      .catch((err) => res.status(400).json("Error" + err));
  },

  /**
   * gets the direct tasks under a project
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns direct tasks under a project
   */

  getDirectTaskByProjectId: (req, res) => {
    // check if the incoming id is valid mongoose id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.json([]);
    }

    return Task.find({ projectID: req.params.id, parentTaskID: null })
      .then((tasks) => res.json(tasks))
      .catch((err) => res.status(400).json("Error" + err));
  },

  /**
   * updates task
   * 
   * @param {express.Request} req
   * @param {express.Response} res
   */
  taskUpdate: async (req, res) => {

    const [isSuccesful, message] = await _getTimeline(req.params.id);

    const [isSuccessful, timeline] = await _createTimeline(req.body.timeline);
    

    let taskUpdate = {
      timeline: req.body.timeline,
      taskOwner: req.body.taskOwner,
      taskName: req.body.taskName,
      taskDetails: req.body.taskDetails,
      weight: req.body.weight

    };

    const options = {
      new: true,
    };

    Task.findByIdAndUpdate(
      req.params.id,
      taskUpdate,
      options,
      (error, updatedTask) => {
        if (error) {
          return res.status(500).json({
            error: "Problem updating user. Please try again.",
          });
        }

        return res.status(201).json({
          message: "User updated successfully!",
          user: updatedTask,
        });
      }
    ).catch((err) => res.status(400).json("Error" + err));
  },
};

/**
 * saves a task in database
 *
 * @param {Task.object} task
 * @returns error message or task in json form
 */

const _createTask = async (task) => {
  const projectID = task.projectID;
  const taskName = task.taskName;
  const parentTaskID = task.parentTaskID;
  const _task = task.task;
  const taskDetails = task.taskDetails;
  const taskHistory = task.taskHistory;
  const taskOwner = task.taskOwner;
  const weight = task.weight;
  const [isSuccessful, timeline] = await _createTimeline(task.timeline);

  const newTask = new Task({
    projectID,
    taskName,
    parentTaskID,
    _task,
    timeline: timeline._id,
    taskHistory,
    taskOwner,
    weight,
    taskDetails,
  });

  return newTask
    .save()
    .then((task) => [true, task])
    .catch((err) => [false, { error: err }]);
};

module.exports = TaskController;
