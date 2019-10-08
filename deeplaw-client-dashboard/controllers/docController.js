require("dotenv").config();
var config = require("../config");
var User = require('../models/user');
var Chat = require('../models/chat');
var Doc = require('../models/docapprove');

var emailSender = require('./emailSender.js');

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
exports.getDocsToApprove = async (req, res) => {
  let current = req.user.email;

  var docs = await Doc.find({approver: current});

  var doclist = [];
  if (docs) {
  	for (var i = docs.length - 1; i >= 0; i--) {
  		var doclinks = [];
  		for (var j = 0; j < docs[i].link.length; j++) {
  			var link = docs[i].link[j];
  			if (link['status'] == "Not approved") {
					var temp = {...link};
					temp['user'] = docs[i].user;
					temp['approver'] = docs[i].approver;
					doclinks.push(temp);
				}
  		}
	  	doclist.push(...doclinks);
  	}
  }

  return res.json({ status: "success", data: doclist });
};

exports.getApprovedDocs = async (req, res) => {
  let current = req.user.email;

  var docs = await Doc.find({user: current});

  var doclist = [];
  if (docs) {
  	for (var i = docs.length - 1; i >= 0; i--) {
  		var doclinks = [];
  		for (var j = 0; j < docs[i].link.length; j++) {
  			var link = docs[i].link[j];
  			if (link['status'] == "Approved") {
					var temp = {...link};
					temp['user'] = docs[i].user;
					temp['approver'] = docs[i].approver;
					doclinks.push(temp);
				}
  		}
	  	doclist.push(...doclinks);
  	}
  }

  return res.json({ status: "success", data: doclist });
};

exports.approveDoc = async (req, res) => {
  let current = req.user.email;
  let user = req.body.content.user;
  let docid= req.body.content.docid;

  var docs = await Doc.findOne({approver: current, user: user});

  let docname = "";

  if (docs) {
  	var links = docs.link;
  	for (var i = links.length - 1; i >= 0; i--) {
  		if (String(links[i]['_id']) == docid) {
				links[i]['status'] = "Approved";
				docname = links[i]['url'].slice(16);
			}
  	}
  	docs.link = links;
		
		console.log(docname);
  	docs.save();

  	await emailSender.sendEmail('spoon.jeremy@gmail.com', user, "There are new documents approved from Deeplaw", 'test', '<strong>' + docname + ' is approved. Please download it.</strong>');
		
  }

  return res.json({ status: "success" });
};
