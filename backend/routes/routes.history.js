const express = require("express");
const HistoryController = require("../controller/controller.history");

const historyRoutes = express.Router();

historyRoutes.get("/", (req, res) => HistoryController.getAllHistory(req, res));
historyRoutes.post("/add", (req, res) => HistoryController.createHistory(req, res));
historyRoutes.get("/:id", (req, res) => HistoryController.getHistory(req, res));

module.exports = historyRoutes;