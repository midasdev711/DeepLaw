require("dotenv").config();
var config = require("../config");
var Chat = require('../models/chat');
var User = require('../models/user');
var DocApprove = require('../models/docapprove');
const _ = require("lodash");

const dialogflow = require('dialogflow');
const uuid = require('uuid');

const structjson = require('./structJson.js');

var emailSender = require('./emailSender.js');

var htmlDocxJs = require("html-docx-js")

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */

class DeepDialogFlow {
  constructor() {
    let privateKey = (process.env.NODE_ENV == "production") ? process.env.DIALOGFLOW_PRIVATE_KEY : process.env.DIALOGFLOW_PRIVATE_KEY
    privateKey = _.replace(privateKey, new RegExp("\\\\n", "\g"), "\n")
    let clientEmail = process.env.DIALOGFLOW_CLIENT_EMAIL
    let config = {
      credentials: {
        private_key: privateKey,
        client_email: clientEmail
      }
    }
    // A unique identifier for the given session
    this.sessionClient = new dialogflow.SessionsClient(config);
    // const sessionId = uuid.v4();
    // this.sessionPath = this.sessionClient.sessionPath('abbi-cvflsy', sessionId);
  }

  getSessionPath() {
    const sessionId = uuid.v4();
    var sessionPath = this.sessionClient.sessionPath('abbi-cvflsy', sessionId);
    return sessionPath;
  }

  async chat(text, sessionPath) {
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: text.replace('\n', ''),
          // The language used by the client (en-US)
          languageCode: 'en-US',
        }
      }
    };
    const responses = await this.sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    
    return result.fulfillmentText;
  }
}

myDialogflow = new DeepDialogFlow();

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.addChat = async function (req, res) {
  let content = req.body.content;
  let sessionPath = null;
  if (req.session['sessionPath']) {
    sessionPath = req.session.sessionPath;
  }
  else {
    req.session['sessionPath'] = myDialogflow.getSessionPath();
    sessionPath = req.session['sessionPath'];
  }
  let resultText = await myDialogflow.chat(content, sessionPath);

  if (resultText.includes('we’re done')) {
    const fs = require('fs');

    // Select Approver
    var approver;
    var admins = await User.find({role: "admin"});
    if (!admins) {
      // handle errors
      console.log("there is no admin");
    }
    else {
      approver = admins[getRandomInt(0, admins.length - 1)];
    }

    var currentUser = await User.findOne({email: req.user.email});

    var info = currentUser['Background_Check_Policy'];

    await emailSender.sendEmail('spoon.jeremy@gmail.com', approver['email'], 'Please approve the documents from Deeplaw', 'test', '<strong>There are documents from ' + req.user.username + '</strong>');
    let data = fs.readFileSync(__dirname + '/../template/test.htm', 'utf8');

    String.prototype.replaceAll = function(search, replacement) {
      var target = this;
      return target.replace(new RegExp(search, 'g'), replacement);
    };
    console.log(info);
    console.log("--------")

    data = data.replaceAll('{{d.employeeName}}', info['employeeName']);
    data = data.replaceAll('{{d.requireMayRequire}}', info['requireMayRequire']);
    data = data.replaceAll('{{d.humanResourcesDepartmentName}}', info['humanResourcesDepartmentName']);
    data = data.replaceAll('{{d.position}}', info['position']);

    var converted = htmlDocxJs.asBlob(data);
    var doclink = '/../public/docs/' + req.user.accessCode + '-Background Check Policy IL.docx';
    fs.writeFile(__dirname + doclink, converted, function(err) {
      if (err) throw err;
    });

    var docapprove = await DocApprove.findOne({user: req.user.email})
    if (!docapprove) {
      docapprove = new DocApprove({
        user: req.user.email,
        approver: approver['email'],
        link: [{
          url: doclink,
          status: "Not approved",
          date: Date.now()
        }]
      });
      docapprove.save();
    }
    else {
      docapprove['link'].push({
        url: doclink,
        status: "Not approved",
        date: Date.now()
      });
      docapprove.save();
    }

  }

  Chat.findOne({username: req.user.username}).then(result => {

    if (!result) {
      var chat = new Chat({
        username: req.user.username, content: [{
          sender: req.user.username,
          text: content,
          date: Date.now()
        }, {
          sender: "Elaina",
          text: resultText,
          date: Date.now()
        }]
      })
      chat.save()
    }
    else {
      // var chatContent = result.content;
      result.content.push({ sender: req.user.username, text: content, date: Date.now() });
      result.content.push({ sender: "Elaina", text: resultText, date: Date.now() });
      result.save();
      // Chat.update({username: req.user.username}, {content: chatContent}, upsert = true);
    }
    // res.json({ status: "success", data: resultText });
  }).catch(err => {
    res.json({ status: "error" });
  })
  return res.json({ status: "success", data: resultText });
};

// Display list of all books.
exports.getChats = async function (req, res) {
  let user = req.user;
  let chatcontent = [];
  Chat.findOne({ username: user.username }).then((result) => {
    if (!result) {
      req.session['sessionPath'] = myDialogflow.getSessionPath();
      sessionPath = req.session['sessionPath'];
      var firstHello = 'Hi';
      myDialogflow.chat(firstHello, sessionPath).then(resultText => {
        var chat = new Chat({
          username: user.username, 
          content: [{
            sender: "Elaina",
            text: resultText,
            date: Date.now()
          }]
        })
        chat.save()
        content = [{
          sender: "Elaina",
          text: resultText,
          date: Date.now()
        }]
        res.json({ status: "success", data: content});
      });
    }
    else {
      chatcontent = []
      result.content.map(content => {
        chatcontent.push({
          sender: content.sender,
          text: content.text,
          date: content.date
        })
      });
      res.json({ status: "success", data: chatcontent });
    }
  });
};

// Display detail page for a specific book.
exports.book_detail = function (req, res) {
  res.send('NOT IMPLEMENTED: Book detail: ' + req.params.id);
};