require("dotenv").config();
var config = require("../config");
var Chat = require('../models/chat');
var User = require('../models/user');
const _ = require("lodash");

const dialogflow = require('dialogflow');
const uuid = require('uuid');

const structjson = require('./structJson.js');

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
    console.log("sessionPath", sessionPath);
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
    console.log('requestd: ', request)
    const responses = await this.sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    
    return result.fulfillmentText;
  }
}

myDialogflow = new DeepDialogFlow();

exports.addChat = async function (req, res) {
  let content = req.body.content;
  let sessionPath = null;
  console.log("-----");
  console.log(req.session);
  if (req.session['sessionPath']) {
    sessionPath = req.session.sessionPath;
  }
  else {
    req.session['sessionPath'] = myDialogflow.getSessionPath();
    sessionPath = req.session['sessionPath'];
  }
  let resultText = await myDialogflow.chat(content, sessionPath);
  console.log(resultText);

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
      myDialogflow.chat('Hi', sessionPath).then(resultText => {
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