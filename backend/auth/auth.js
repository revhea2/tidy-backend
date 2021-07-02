const jwt = require("jsonwebtoken");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const secret = process.env.SECRET;

/**
 * creates an access token for successfully logged in users
 *
 * @param {object} userData - user's login data
 * @returns access token
 */
const createAccessToken = (userData) => {
  const payload = {
    id: userData._id,
  };

  return jwt.sign(payload, secret, {});
};

const verify = (req, res, next) => {
  let bearerHeader = req.headers.authorization;

  if (typeof bearerHeader !== "undefined") {
    const [bearer, bearerToken] = bearerHeader.split(" ");
    return jwt.verify(bearerToken, secret, (error, data) => {
      return error
        ? res.status(401).send({ error: "User is not authenticated!" })
        : next();
    });
  } else {
    return res.status(401).send({ error: "User is not authenticated!" });
  }
};

const decode = (token) => {
  if (typeof bearerHeader !== "undefined") {
    const [bearer, bearerToken] = token.split(" ");

    return jwt.verify(token, secret, (error, data) => {
      return error ? null : jwt.decode(bearerToken, { complete: true }).payload;
    });
  }
};

module.exports = {
  createAccessToken,
  verify,
};
