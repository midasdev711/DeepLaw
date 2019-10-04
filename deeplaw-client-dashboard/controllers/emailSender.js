require("dotenv").config();
var config = require("../config");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */

// Display list of all books.
exports.sendEmail = (from, to, subject, text, html) => {
  const msg = {
    to: to,
    from: from,
    subject: subject,
    text: text,
    html: html
  sgMail.send(msg);
};