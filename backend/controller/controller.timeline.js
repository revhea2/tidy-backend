const express = require("express");
const Timeline = require("../models/timeline.model");

const TimelineController = {
  /**
   * gets all timelines from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns all timelines in the database
   */

  getAllTimeline: (req, res) => {
    return Timeline.find()
      .then((timelines) => res.send(timelines))
      .catch((err) => res.status(400).json("Error" + err));
  },

  /**
   * saves a timeline to the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   */

  createTimeline: async (req, res) => {
    const [isSuccesful, message] = await _createTimeline(req.body);
    return isSuccesful
      ? res.status(201).json(message)
      : res.status(400).json(message);
  },

  /**
   * gets a timeline by ID from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns a single timeline from database
   */

  getTimeline: async (req, res) => {
    const [isSuccesful, message] = await _getTimeline(req.params.id);
    return isSuccesful
      ? res.status(201).json(message)
      : res.status(400).json(message);
  },

  /**
   * gets a specific timeline by ID
   *
   * @param {String ID} timelineID
   * @returns error message and/or json of a timeline object
   */
  _getTimeline: (timelineID) => {
    return Timeline.findById(timelineID)
      .then((timeLine) => [true, timeLine])
      .catch((err) => [false, { error: err }]);
  },

  /**
   * creates a timeline
   *
   * @param {Timeline.object} timeline
   * @returns error message and/or json of the created task object
   */
  _createTimeline: (timeline) => {
    const startDate = Date.parse(timeline.startDate);
    const endDate = Date.parse(timeline.endDate);
    const progress = Number(timeline.progress);

    const newTimeline = new Timeline({
      startDate,
      endDate,
      progress,
    });

    return newTimeline
      .save()
      .then((timeLine) => [true, timeLine])
      .catch((err) => [false, { error: err }]);
  },
};

module.exports = TimelineController;
