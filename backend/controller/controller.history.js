const express = require("express");
const {
  _getHistory,
  _getAllHistory,
  _createHistory,
} = require("../utils/util.history");

const HistoryController = {
  /**
   * gets all histories from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns all histories in the database
   */

  getAllHistory: async (req, res) => {
    const history = await _getAllHistory(req.params.id);
    return history !== null
      ? res.status(200).json(history)
      : res.status(400).json("Error in fetching all histories!");
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

  getHistory: (req, res) => {
    // check if the incoming id is valid mongoose id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.json("Invalid route!");
    }

    let history = _getHistory(req.params.id);
    return history !== null
      ? res.status(200).json(history)
      : res.status(400).json("Error in getting a history!");
  },
};

module.exports = HistoryController;
