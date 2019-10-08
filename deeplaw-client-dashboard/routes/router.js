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
var docController = require("../controllers/docController");

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

router.get("/approve", (req, res, next) => {
  res.sendFile(path.join(__basedir + '/public/pages/approve.html'));
});

router.get("/documents", (req, res, next) => {
  res.sendFile(path.join(__basedir + '/public/pages/documents.html'));
});

router.get("/terms", (req, res, next) => {
  res.sendFile(path.join(__basedir + '/public/pages/terms.html'));
});

// Doc list

router.get("/api/getDocsToApprove", docController.getDocsToApprove);
router.get("/api/getApprovedDocs", docController.getApprovedDocs);
router.post("/api/approveDoc", docController.approveDoc);
// ChatController

router.post("/api/chat", chatController.addChat);
router.get("/api/getChats", chatController.getChats);

// AuthController

router.post("/auth/register", authController.register);
router.post("/auth/charge", authController.charge);
router.post("/auth/login", authController.login);
router.get("/auth/logout", authController.logout);
router.get("/webhook", authController.webhook);
router.get("/api/me", authController.getMe);
router.get('/clr', authController.clear);

module.exports = router;
