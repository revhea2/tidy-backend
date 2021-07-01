const express = require("express");
const TimelineController = require("../controller/controller.timeline");

const timelineRoutes = express.Router();

timelineRoutes.get("/", (req, res) => TimelineController.getAllTimeline(req, res));
timelineRoutes.post("/add", (req, res) => TimelineController.createTimeline(req, res));
timelineRoutes.get("/:id", (req, res) => TimelineController.getTimeline(req, res));

module.exports = timelineRoutes;