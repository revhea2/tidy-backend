const express = require("express");
const Task = require("../models/task.model");
const { decode } = require("../auth/auth.js");
const { _createTimeline } = require("./controller.timeline");
const { _getProject, _updateProject } = require("./controller.project");
const { _createHistory } = require("./controller.history");
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
    req.body["taskOwner"] = [userID, ...req.body["taskOwner"]];

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

    await _updateProgress(message);

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
      .sort({ createdAt: -1 })
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

    req.body["_id"] = req.params.id;

    const [isSuccesful, message] = await _updateTask(req.body);
    return isSuccesful
      ? res.status(201).json(message)
      : res.status(400).json(message);
  },


  /**
   * 
   * @param {Express.Request} req 
   * @param {Express.Response} res 
   * @returns 
   */

  computeProgress: async (req, res) => {
    await _updateTask(req.body);
    const [isSuccessful, task] = await _getTask(req.body._id);
    if (isSuccessful) {
      await _updateProgress(task);
    }

    return res.status(200).json("No error!");
  },
};

// <--------- all utility methods starts here ------------------------------------------------------------------------------------------------------>


/**
 * helper method that updates progress of a single task 
 * 
 * @param {Object} task 
 * @returns [boolean, Object]
 */
const _updateTaskProgress = async (task) => {

  const [isSuccessful, newTimeline] = await _createTimeline(task.timeline);

  return Task.findOneAndUpdate({"_id": task._id},  { $set: {'timeline': newTimeline._id } }, { upsert: true, new: true }, )
      .then((results) => {
        console.log(newTimeline.progress)
          return [true, results];
        })
      .catch((err) => {
        return [false, { error: err }];
      });
};


/**
 * this a helper method that updates the progress of a task
 * the algorithm that is used here is an inversed-limited dfs
 * 
 * @param {Object} task 
 */

const _updateProgress = async (task) => {
  var queue = [task];
  var currentTask = task;

  while (queue.length > 0) {
    currentTask = queue.shift();

    if (currentTask.task.length > 0) {
      let timeline = currentTask.timeline;
      let totalWeight = 0;
      let totalProgress = 0
      currentTask.task.forEach((subtask) => {
        totalProgress += subtask.weight * subtask.timeline.progress;
        totalWeight += subtask.weight;
      });
      
      timeline["progress"] = totalProgress/totalWeight;
      const updateProgressTask = {
        _id: currentTask._id,
        timeline: timeline,
      };
      await _updateTaskProgress(updateProgressTask);
    }

    if (currentTask.parentTaskID) {
      const [b, parentTask] = await _getTask(currentTask.parentTaskID);
      queue.push(parentTask)
    }

  }

  let [sucessful, project] = await _getProject(currentTask.project);
  if (sucessful) {
    let timeline = project.timeline;
    let totalWeight = 0;
    let totalProgress = 0;
    timeline["progress"] = 0;
    project.task.forEach((subtask) => {
      totalProgress += subtask.weight * subtask.timeline.progress;
      totalWeight += subtask.weight;
    });

    timeline["progress"] = totalProgress / totalWeight;
    const updateProgressProject = {
      _id: project._id,
      timeline: timeline,
    };
    await _updateProject(updateProgressProject);
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
    .populate({ 
      path: "taskHistory", 
      options: {sort: { "createdAt": -1 }},
      populate: {
        path: "userList timeline",
      } 
    })
    .populate({ 
      path: "task", 
      options: {sort: { "createdAt": -1 }},
      populate: {
        path: "taskOwner timeline",
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




/**
 * this method updates and return the task that has been updated
 * 
 * @param {Object} task 
 * @returns Object
 */

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
  if(task.weight){
    remarks += "Weight is updated. \n";
    tempTask["weight"] = task.weight;
  }

  history["remarks"] = remarks;

  const [isSuccesful, newHistory] = await _createHistory(history);

  if (isSuccesful) {
    tempTask["taskHistory"] = oldTask.taskHistory.concat(newHistory._id);
  } else {
    tempTask["taskHistory"] = oldTask.taskHistory;
  }

  const options = {
    new: true,
  };

  return Task.findByIdAndUpdate(task._id, tempTask, options)
    .then( async (_task) => {
      
      if(task.timeline !== null && task.timeline.progress != oldTask.timeline.progress){ 
        await _updateProgress(_task);
      }

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
  const taskOwner = task.taskOwner;
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
      task.populate("timeline").execPopulate();
      return [true, task];
    })
    .catch((err) => [false, { error: err }]);
};



module.exports = TaskController;
