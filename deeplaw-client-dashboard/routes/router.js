require("dotenv").config();
const express = require("express");
const router = express.Router();
const _ = require("lodash");
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var config = require("../config");
var path = require('path');
var passport = require('passport');

var URL = process.env.MONGO_URL;

var userModel = require("../models/user");

var chatController = require("../controllers/chatController");
var authController = require("../controllers/authController");

router.get("/", (req, res, next) => {
  res.sendFile(path.join(__basedir + '/public/pages/login.html'));
});

router.get("/home", (req, res, next) => {
  res.sendFile(path.join(__basedir + '/public/pages/index.html'));
});

router.get("/register", (req, res, next) => {
  res.sendFile(path.join(__basedir + '/public/pages/register.html'));
});

router.get("/about", (req, res, next) => {
  res.sendFile(path.join(__basedir + '/public/pages/about.html'));
});

router.get("/subscribe", (req, res, next) => {
  res.sendFile(path.join(__basedir + '/public/pages/subscribe.html'));
});

router.get("/chat", (req, res, next) => {
  res.sendFile(path.join(__basedir + '/public/pages/chat.html'));
});

router.post("/auth/register", authController.register);

router.post("/api/chat", chatController.addChat);
router.get("/api/getChats", chatController.getChats);

router.post("/auth/login", authController.login);

router.get("/auth/logout", authController.logout);

router.get("/api/me", authController.getMe);

module.exports = router;
