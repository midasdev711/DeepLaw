require("dotenv").config();
var config = require("../config");
var User = require('../models/user');
var Chat = require('../models/chat');
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
  User.findOne({ email: username, password: passwordHash }).then(
    result => {
      if (result != null) {
        if (result.status == "deactive") {
          res.status(401).send({ error: "You should pay first." });
        }
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

handleInvoiceCreated = (expired) => {
  console.log(expired['customer_email']);
  var email = expired['customer_email']
  User.findOne({ email: email }).then(async (result) => {
    if (result != null) {
      result['statue'] = "deactive"
      result.save()
    }
  });
}

handleInvoiceSucceeded = (expired) => {
  console.log(expired['customer_email']);
  var email = expired['customer_email']
  User.findOne({ email: email }).then(async (result) => {
    if (result != null) {
      result['statue'] = "active"
      result.save()
    }
  });
}

exports.webhook = (request, response) => {
  let event;

  try {
    event = JSON.parse(request.body);
  }
  catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'invoice.created':
      var invoice = event.data.object;
      handleInvoiceCreated(invoice);
      break;
    case 'invoice.payment_succeeded':
      var invoice = event.data.object;
      handleInvoiceSucceeded(invoice);
      break;
    // ... handle other event types
    default:
      // Unexpected event type
      return response.status(400).end();
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}

exports.charge = (req, res) => {
  let content = req.body.content;
  let password = content.password;
  let username = content.fullname;
  let companyname = content.companyname;
  let email = content.email;
  let subType = content.subType;
  let stripeToken = content.stripeToken;

  const stripe = require("stripe")("sk_test_1uJa0fbPKGPKmg2J0Qx5YGoL00ELsCvQUG");

  let customer_id;
  let status;

  var passwordHash = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");
  User.findOne({ email: email }).then(async (result) => {
    if (result == null) {
      try {
        const customer = await stripe.customers.create({
          email: email,
          description: 'Customer for ' + email,
          source: "tok_mastercard" // obtained with Stripe.js
        });
        customer_id = customer['id'];
      }
      catch {

      }
      try {
        const subscription = await stripe.subscriptions.create({
          customer: customer_id,
          items: [
            {
              plan: subType,
            },
          ],
          expand: ['latest_invoice.payment_intent'],
        });
        status = subscription['status'];
      }
      catch {

      }
      if (status == "active") {
        var accessCode = '' + Math.floor(100000 + Math.random() * 900000);
        while (true) {
          result = await User.findOne({ accessCode: accessCode });
          if (!result) {
            break;
          }
          else {
            accessCode = '' + Math.floor(100000 + Math.random() * 900000);
          }
        }
        
        var user = new User({
          username: username,
          email: email,
          password: passwordHash,
          companyName: companyname,
          subscriptionType: subType,
          status: "active",
          accessCode: accessCode
        });
        user.save()
        .then(result => {
          var token = jwt.sign({ _id: result["_id"] }, config.jwtSecret, {
            expiresIn: 86400 // expires in 24 hours
          });

          res.json({
            userId: result["_id"],
            message: "Created Succesfully",
            token: token
          });
        })
        .catch(error => {
          res.json({message: "Error", error: error });
        });
      }
      else if (status == "incomplete") {
        res.json({message: "Error", error: "Checkout Failed"});
      }      
    } else {
      res.json({message: "Error", error: "Username Exists" });
    }
  });
};

exports.clear = (request, response) => {
  return User.remove({}).then(() => {
    Chat.remove({}).then(() => {
      response.json({result: "Successfully removed"});
    });
  });

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}