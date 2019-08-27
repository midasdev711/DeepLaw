require("dotenv").config();
var config = require("../config");
var Chat = require('../models/chat');
var User = require('../models/user');
const _ = require("lodash");

const dialogflow = require('dialogflow');
const uuid = require('uuid');

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
  }

  async chat(text, projectId = 'abbi-cvflsy') {
    const sessionId = uuid.v4();

    // Create a new session
    // console.log('config: ', config)
    const sessionPath = this.sessionClient.sessionPath(projectId, sessionId);

    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: text.replace('\n', ''),
          // The language used by the client (en-US)
          languageCode: 'en-US',
        },
      },
    };
    console.log('requestd: ', request)

    // Send request and log result
    const responses = await this.sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log('Intent: ', result);
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
    return result.fulfillmentText;
  }
}

myDialogflow = new DeepDialogFlow();

exports.addChat = async function (req, res) {
  let content = req.body.content;
  let resultText = await myDialogflow.chat(content);
  Chat.findOne({ username: req.user.username }).then(result => {
    if (!result) {
      var chat = new Chat({
        username: req.user.username, content: [{
          sender: req.user.username,
          text: content,
          date: Date.now()
        }, {
          sender: "Elaina",
          text: resultText
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
exports.getChats = function (req, res) {
  let user = req.user;
  Chat.findOne({ username: user.username }).then(result => {
    if (!result) {
      res.json({ status: "warning", data: "No chat" });
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