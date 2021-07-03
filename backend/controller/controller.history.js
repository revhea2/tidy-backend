const express = require("express");
const History = require("../models/history.model");
const { _createHistory } = require("../utils/util.history");

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
    res.json(await _createHistory(req.body));
  },

  /**
   * gets a history by ID from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns a single history from database
   */

  getHistory: async (req, res) => {
    // check if the incoming id is valid mongoose id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.json("Invalid route!");
    }

    History.findById(req.params.id)
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
};

module.exports = HistoryController;
