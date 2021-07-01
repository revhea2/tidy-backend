const express = require("express");
const User = require("../models/user.model");

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
   * @param {express.Request} req
   * @param {express.Response} res
   */

  registerUser: (req, res) => {
    const badgeID = req.body.badgeID;
    const username = req.body.username;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const jobTitle = req.body.jobTitle;
    const emailAddress = req.body.emailAddress;
    const additionalInfo = req.body.additionalInfo;

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

        user.save()
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
  }
};

module.exports = UserController;
