const express = require("express");
const History = require("../models/history.model");
const {_getHistory} = require("../utils/util.history");

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
      .then((histories) => res.send(histories))
      .catch((err) => res.status(400).json("Error" + err));
  },

  /**
   * saves a history to the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   */

  createHistory: (req, res) => {
    const userList = req.body.userList;
    const remarks = req.body.remarks;
    const updateDate = Date(req.body.updateDate);
    const timeline = req.body.timeline;

    const newHistory = new History({
        userList, 
        remarks,
        updateDate,
        timeline
    });

    newHistory
      .save()
      .then(() => res.json("History added!"))
      .catch((err) => res.status(400).json("Error" + err));
  },

  /**
   * gets a history by ID from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns a single history from database
   */

  getHistory: (req, res) => {
    let a;
    try{
      a = _getHistory(req.params.id);
    }catch(error){
      console.log(error)
    }
    
    return a !== null? a: []
  },
};

module.exports = HistoryController;
