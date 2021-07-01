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

  createTimeline: (req, res) => {
    const startDate = Date.parse(req.body.startDate);
    const endDate = Date.parse(req.body.endDate);
    const progress = Number(req.body.progress);

    const newTimeline = new Timeline({
      startDate,
      endDate,
      progress,
    });

    newTimeline
      .save()
      .then(() => res.json("Timeline added!"))
      .catch((err) => res.status(400).json("Error" + err));
  },

  /**
   * gets a timeline by ID from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns a single timeline from database
   */

  getTimeline: (req, res) => {
    return Timeline.findById(req.params.id)
      .then((timeline) => res.json(timeline))
      .catch((err) => res.status(400).json("Error" + err));
  },
};

module.exports = TimelineController;
