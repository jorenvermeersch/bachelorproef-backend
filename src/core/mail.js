const config = require('config');
const nodemailer = require('nodemailer');

const MAIL_HOST = config.get('mail.host');
const MAIL_PORT = config.get('mail.port');
const MAIL_USERNAME = config.get('mail.username');
const MAIL_PASSWORD = config.get('mail.password');

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  auth: {
    user: MAIL_USERNAME,
    pass: MAIL_PASSWORD,
  },
});

const from = {
  from: {
    name: 'BudgetApp',
    address: 'budgetapp.support@hogent.be',
  },
};

/**
 * Sends an email using `nodemailer`.
 *
 * @param {object} messageOptions - [The message options](https://nodemailer.com/message/) for the e-mail.
 * @param {Function} callback The callback function.
 */
const sendMail = async ({ to, subject, text, html }, callback = () => {}) => {
  const mailOptions = { ...from, to, subject, text, html };
  await transporter.sendMail(mailOptions, callback);
};

module.exports = {
  sendMail,
};
