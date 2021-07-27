const express = require("express");
const TimelineController = require("../controller/controller.timeline");

const timelineRoutes = express.Router();



// timelineRoutes.get("/", verify, (req, res) => TimelineController.getAllTimeline(req, res));
// timelineRoutes.post("/add", verify, (req, res) => TimelineController.createTimeline(req, res));
// timelineRoutes.get("/:id", verify, (req, res) => TimelineController.getTimeline(req, res));


// debug
timelineRoutes.get("/", (req, res) => TimelineController.getAllTimeline(req, res));
timelineRoutes.post("/add", (req, res) => TimelineController.createTimeline(req, res));
timelineRoutes.get("/:id", (req, res) => TimelineController.getTimeline(req, res));

module.exports = timelineRoutes;