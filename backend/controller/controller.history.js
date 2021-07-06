const express = require("express");
const History = require("../models/history.model");
const { _createTimeline } = require("./controller.timeline");

const HistoryController = {
  /**
   * gets all histories from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns all histories in the database
   */

  getAllHistory: (req, res) => {
    return History.find()
      .populate("timeline")
      .populate("userList", [
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
   * saves a history to the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   */

  createHistory: async (req, res) => {
    const [isSuccesful, message] = await _createHistory(req.body);
    return isSuccesful
      ? res.status(201).json(message)
      : res.status(400).json(message);
  },

  /**
   * gets a history by ID from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns a single history from database
   */

  getHistory: (req, res) => {
    // check if the incoming id is valid mongoose id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json("Invalid route/mongoose ID!");
    }

    return History.findById(req.params.id)
      .populate("timeline")
      .populate("userList", [
        "badgeID",
        "firstName",
        "lastName",
        "jobTitle",
        "additionalInfo",
        "emailAddress",
      ])
      .exec(function (err, results) {
        if (err) {
          res.status(400).json({ error: err });
        }
        res.status(200).json(results);
      });
  },

  _createHistory: async (history) => {

    let historyObject = {
      remarks: history.remarks,
      updateDate: Date.now(),
    };

    if (history.userList) {
      historyObject["userList"] = history.userList;
    }
    if (history.timeline) {
      const [isSuccessful, timeline] = await _createTimeline(history.timeline);
      historyObject["timeline"] = timeline._id;
    }

    const newHistory = History(historyObject);

    return newHistory
      .save()
      .then((hist) => [true, hist])
      .catch((err) => [false, { error: err }]);
  },
};

module.exports = HistoryController;
