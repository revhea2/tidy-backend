const express = require("express");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const {
  checkUserRegistrationFieldsValidity,
} = require("../utils/util.controller");
const UserController = {
  /**
   * gets all users from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns All users in database
   */

  getAllUsers: (req, res) => {
    return User.find()
      .then((data) => res.send(data))
      .catch((err) => res.status(400).json("Error" + err));
  },

  /**
   * registers user to the database
   *
   * @param {express.Request} newUserData
   * @param {express.Response} res
   */

  registerUser: async (req, res) => {
    let newUserData = req.body;
    let hashedPassword = "";

    const userFieldsError = checkUserRegistrationFieldsValidity(req);

    try {
      hashedPassword = await bcrypt.hash(newUserData.password, 10);
    } catch {
      return res.status(400).json({
        error: "Error with hashing.",
      });
    }

    if (userFieldsError) {
      return res.status(400).json(userFieldsError);
    }

    let users;

    // checks if username already exists in db
    try {
      users = await User.find({ username: newUserData.username });
      if (users.length > 0) {
        return res.status(400).json({
          error: "User with username already exists.",
        });
      }
    } catch (err) {
      return res.status(400).json(err);
    }

    // checks if badgeID already exists in db
    try {
      users = await User.find({ badgeID: newUserData.badgeID });
      if (users.length > 0) {
        return res.status(400).json({
          error: "User with badgeID already exists.",
        });
      }
    } catch (err) {
      return res.status(400).json(err);
    }

    // checks if email already exists in db
    try {
      users = await User.find({ emailAddress: newUserData.emailAddress });
      if (users.length > 0) {
        return res.status(400).json({
          error: "User with email already exists.",
        });
      }
    } catch (err) {
      return res.status(400).json(err);
    }

    const badgeID = newUserData.badgeID;
    const username = newUserData.username;
    const password = hashedPassword;
    const firstName = newUserData.firstName;
    const lastName = newUserData.lastName;
    const jobTitle = newUserData.jobTitle;
    const emailAddress = newUserData.emailAddress;
    const additionalInfo = newUserData.additionalInfo;

    const newUser = new User({
      badgeID,
      username,
      password,
      firstName,
      lastName,
      jobTitle,
      emailAddress,
      additionalInfo,
    });

    newUser
      .save()
      .then(() => res.json("User added!"))
      .catch((err) => res.status(400).json("Error" + err));
  },

  /**
   * updates user in the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   */
  userUpdate: (req, res) => {
    User.findById(req.params.id)
      .then((user) => {
        user.badgeID = req.body.badgeID;
        user.username = req.body.username;
        user.password = req.body.password;
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.jobTitle = req.body.jobTitle;
        user.emailAddress = req.body.emailAddress;
        user.additionalInfo = req.body.additionalInfo;

        user
          .save()
          .then(() => res.json("User updated!"))
          .catch((err) => res.status(400).json("Error" + err));
      })
      .catch((err) => res.status(400).json("Error" + err));
  },

  /**
   * gets a user from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns an individual user by ID
   */

  getUser: (req, res) => {
    return User.findById(req.params.id)
      .then((user) => res.json(user))
      .catch((err) => res.status(400).json("Error" + err));
  },
};

module.exports = UserController;
