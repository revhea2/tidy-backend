const express = require("express");
const Task = require("../models/task.model");
const { decode } = require("../auth/auth.js");
const { _createTimeline } = require("./controller.timeline");
const { _getProject, _updateProject } = require("./controller.project");
const { _createHistory } = require("./controller.history");
const Node = require("../utils/util.node");


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
      .sort({ createdAt: -1 })
      .exec(function (err, results) {
        if (err) {
          res.status(400).json({ error: "Error in getting all tasks." });
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
    
    const userID = decode(req.headers.authorization).id;
    req.body["taskOwner"] = [userID, ...req.body["taskOwner"]]
    
    const [isSuccesful, message] = await _createTask(req.body);
   

    if (!isSuccesful) {
      res.status(400).json(message);
    }

    // if it is a root task
    if (message.parentTaskID == null) {
      const [b, projectObj] = await _getProject(message.project);
      projectObj.task = projectObj.task.push(message._id);
      await _updateProject({ _id: projectObj._id, task: projectObj.task });
    } else {
      const [b, taskObj] = await _getTask(message.parentTaskID);
      taskObj.task = taskObj.task.push(message._id);
      await _updateTask({ _id: taskObj._id, task: taskObj.task });
    }

    return res.status(201).json(message);
  },

  /**
   * gets a task by ID from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns a single task from database
   */

  getTask: async (req, res) => {
    // check if the incoming id is valid mongoose id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json("Invalid route/mongoose ID!");
    }

    const [isSuccesful, message] = await _getTask(req.params.id);

    return isSuccesful
      ? res.status(201).json(message)
      : res.status(400).json(message);
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
    // if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    //   return res.json([]);
    // }
    const userID = decode(req.headers.authorization).id;

    return Task.find({ taskOwner: userID })
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
      .sort({ createdAt: -1 })
      .then((results) => {
        res.status(200).json(results);
      })
      .catch((err) => {
        res.status(400).json({ error: err });
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
   * @returns
   */
   updateTask: async (req, res) => {
    // check if the incoming id is valid mongoose id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json("Invalid route/mongoose ID!");
    }

    const [isSuccesful, message] = await _updateTask(req.body);
    return isSuccesful
      ? res.status(201).json(message)
      : res.status(400).json(message);
  },

    /**
   * computes the current total progress of a task
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns total progress of task
   */
     computeTaskProgress: async (req, res) => {
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json("Invalid route/mongoose ID!");
      }
  
      const [isSuccesful, result] = await _getTask(req.params.id);
  
      if (isSuccesful) {
        const tree = await _createTree(result);
        // _bfs(tree);
        console.log(_dfs(tree));
      }
      return res.status(200).json("No error!");
    },


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

const _createTree = async (root) => {
  var parentNode = new Node(root.weight, root.timeline.progress, root.taskName);

  var stack = root.task;
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
    .populate("timeline")
    .populate("project", "projectName")
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
    .populate({
      path: "task",
      populate: {
        path: "timeline"
      }
    })
    .populate("taskOwner", [
      "badgeID",
      "firstName",
      "lastName",
      "jobTitle",
      "additionalInfo",
      "emailAddress",
    ])
    .then((results) => {
      return [true, results];
    })
    .catch((err) => {
      return [false, { error: err }];
    });
};


const _updateTask = async (task) => {
  const [successful, oldTask] = await _getTask(task._id);
  let remarks = "";
  let tempTask = {};
  let history = {};

  if (task.taskOwner) {
    history["userList"] = oldTask.taskOwner;
    tempTask["taskOwner"] = task.taskOwner;
    remarks += "Task owner was altered. \n";
  }
  if (task.taskName) {
    tempTask["taskName"] = task.taskName;
    remarks += "Task name was altered. \n";
  }
  if (task.task) {
    history["task"] = oldTask.task;
    tempTask["task"] = task.task;
    remarks += "A subtask was added. \n";
  }
  if (task.timeline) {
    history["timeline"] = oldTask.timeline;
    const [isSuccessful, newTimeline] = await _createTimeline(task.timeline);
    tempTask["timeline"] = newTimeline._id;
    remarks += "Timeline was changed. \n";
  }
  if (task.taskDetails) {
    tempTask["taskDetails"] = task.taskDetails;
    remarks += "Task details was changed. \n";
  }

  history["remarks"] = remarks;

  const [isSuccesful, newHistory] = await _createHistory(history);

  if (isSuccesful) {
    tempTask["taskHistory"] = oldTask.taskHistory.concat(
      newHistory._id
    );
  } else {
    tempTask["taskHistory"] = oldTask.taskHistory;
  }

  const options = {
    new: true,
  };

  return Task.findByIdAndUpdate(task._id, tempTask, options)
    .then((task) => {
      return [true, task];
    })
    .catch((err) => {
      return [false, { err: err }];
    });
};

/**
 * saves a task in database
 *
 * @param {Task.object} task
 * @returns error message or task in json form
 */

const _createTask = async (task) => {

  const parentTaskID = task.parentTaskID;
  const project = task.project;
  const taskName = task.taskName;
  const _task = task.task;
  const taskDetails = task.taskDetails;
  const taskHistory = task.taskHistory;
  const taskOwner =  task.taskOwner;
  const weight = task.weight;
  const [isSuccessful, timeline] = await _createTimeline(task.timeline);

  const newTask = new Task({
    project,
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
    .then((task) => {
      task.populate("timeline").execPopulate()
      return  [true, task];
    })
    .catch((err) => [false, { error: err }]);
};





module.exports = TaskController;
