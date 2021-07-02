const jwt = require("jsonwebtoken");
const express = require("express");
const dotenv = require("dotenv");

// might need
dotenv.config();
const secret = process.env.SECRET;
