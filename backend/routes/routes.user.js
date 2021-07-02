const express = require("express");
const UserController = require("../controller/controller.user");
const { verify } = require("../auth/auth");

const userRoutes = express.Router();

userRoutes.get("/", (req, res) => UserController.getAllUsers(req, res));
userRoutes.post("/add", (req, res) => UserController.registerUser(req, res));
userRoutes.post("/:id", verify, (req, res) => UserController.userUpdate(req, res));
userRoutes.post("/login", (req, res) => UserController.loginUser(req, res));
userRoutes.get("/:id", (req, res) => UserController.getUser(req, res));


module.exports = userRoutes;
