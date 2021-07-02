const express = require("express");
const Joi = require("@hapi/joi");


/**
 * checks all possible errors in user registration fields
 * 
 * @param {express.Request} req 
 * @returns errors in registration fields
 */
const checkUserRegistrationFieldsValidity = (req) => {
  const { error } = registerValidation(req.body);

  return error;
};

/**
 * uses @hapi/joi to validate user fields
 * 
 * @param {express.Request.body} data 
 * @returns all info for the validation
 */
const registerValidation = (data) => {
  // Minimum six characters, at least one letter, one number
  const passwordPattern = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$";

  const userSchema = Joi.object({
    badgeID: Joi.string().min(6).required(),
    username: Joi.string().min(6).required(),
    password: Joi.string().min(6).required().regex(RegExp(passwordPattern)),
    firstName: Joi.string().min(1).required(),
    lastName: Joi.string().min(1).required(),
    jobTitle: Joi.string().min(1).required(),
    emailAddress: Joi.string().min(6).email(),
    additionalInfo: Joi.string(),
  });

  return userSchema.validate(data);
};

module.exports = {
    checkUserRegistrationFieldsValidity,
};
