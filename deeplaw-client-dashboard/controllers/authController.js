require("dotenv").config();
var config = require("../config");
var User = require('../models/user');
const _ = require("lodash");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
exports.register = (req, res) => {
  let password = req.body.password;
  let username = req.body.username;
  let email = req.body.email;

  var passwordHash = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");
  User.findOne({ username: username }).then(result => {
    if (result == null) {

      var user = new User({
          username: username,
          email: email,
          password: passwordHash
        });
      user.save()
      .then(result => {
        var token = jwt.sign({ _id: result["_id"] }, config.jwtSecret, {
          expiresIn: 86400 // expires in 24 hours
        });

        res.send({
          userId: result["_id"],
          message: "Created Succesfully",
          token: token
        });
      })
      .catch(error => {
        res.send({message: "Error", error: error });
      });
    } else {
      res.status(401).send({ error: "Username Exists" });
    }
  });
};

// Display list of all books.
exports.login = (req, res) => {
  let password = req.body.password;
  let username = req.body.username;

  var passwordHash = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");
  User.findOne({ username: username, password: passwordHash }).then(
    result => {
      if (result != null) {
        var token = jwt.sign({ _id: result._id }, config.jwtSecret, {
          expiresIn: 86400 // expires in 24 hours
        });
        res.send({ auth: true, token: token });
      } else {
        res.status(401).send({ error: "Incorrect Credentials" });
      }
    })
    .catch(err => {
      res.status(401).send({ error: err });
    });
};

// Display detail page for a specific book.
exports.logout = (req, res) => {
  req.session.destroy((err) => {
      if(err) {
          return console.log(err);
      }
      res.redirect('/');
  });
};

exports.getMe = (req, res) => {
  var token = req.headers["authorization"];
  token = token.split(" ");
  if (!token[1])
    return res.status(401).send({ auth: false, message: "No token provided." });

  jwt.verify(token[1], config.jwtSecret, function(err, decoded) {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });
    User.findOne({ _id: decoded._id }).then(result => {
      if (result) {
        var data = {
          userId: result["_id"],
          username: result["username"]
        };
        res.status(200).send(data);
      }
    })
    .catch(err => {
      res.status(401).send({ error: err });
    });
  });
};