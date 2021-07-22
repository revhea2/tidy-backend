const express = require("express");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const {
  checkUserRegistrationFieldsValidity,
} = require("../utils/util.controller");

const { createAccessToken, decode } = require("../auth/auth.js");
const UserController = {
  /**
   * gets all users from the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns All users in database
   */

  getAllUsers: (req, res) => {
    let userID = decode(req.headers.authorization).id

    return User.find({ "_id" : { $ne: userID } }).select("_id lastName firstName")
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
      return res.status(409).json(userFieldsError);
    }

    let user;

    // checks if username already exists in db
    try {
      user = await User.findOne({ username: newUserData.username });
      if (user) {
        return res.status(409).json({
          error: "User with username already exists.",
        });
      }
    } catch (err) {
      return res.status(400).json(err);
    }

    // checks if badgeID already exists in db
    try {
      user = await User.findOne({ badgeID: newUserData.badgeID });
      if (user) {
        return res.status(409).json({
          error: "User with badgeID already exists.",
        });
      }
    } catch (err) {
      return res.status(400).json(err);
    }

    // checks if email already exists in db
    try {
      user = await User.findOne({ emailAddress: newUserData.emailAddress });
      if (user) {
        return res.status(409).json({
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
      .then(() => res.status(201).json("User added!"))
      .catch((err) => res.status(400).json("Error" + err));
  },

  /**
   * authenticate user by email and password
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns access token of the authenticated
   */

  loginUser: async (req, res) => {
    let user;
    try {
      user = await User.findOne({
        badgeID: req.body.badgeID,
        username: req.body.username,
      });
    } catch (err) {
      return res.status(400).json(err);
    }

    if (user == null) {
      return res.status(400).json("No user exists with the given credentials!");
    }

    try {
      const isPasswordMatched = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!isPasswordMatched) {
        return res.status(400).json("Password did not match!");
      }

      return res.status(200).json({
        accessToken: createAccessToken(user.toObject()),
      });
    } catch (err) {
      return res.status(400).json(err);
    }

    //
  },

  /**
   * updates user in the database
   *
   * @param {express.Request} req
   * @param {express.Response} res
   */
  userUpdate: (req, res) => {

    let userID = decode(req.headers.authorization).id

    let userUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      jobTitle: req.body.jobTitle,
      additionalInfo: req.body.additionalInfo,
    };

    const options = {
      new: true,
    };

    User.findByIdAndUpdate(
      userID,
      userUpdate,
      options,
      (error, updatedUser) => {
        if (error) {
          return res.status(500).json({
            error: "Problem updating user. Please try again.",
          });
        }

        return res.status(201).json({
          message: "User updated successfully!",
          user: updatedUser,
        });
      }
    ).catch((err) => res.status(400).json("Error" + err));
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

  /**
   * retrieve user info based on JWT received
   * 
   * @param {express.Request} req 
   * @param {express.Response} res 
   */
  getCurrentUser: (req, res) => {
    let userID = decode(req.headers.authorization).id

    return User.findById(userID)
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json("Error" + err));
  },
};

module.exports = UserController;
