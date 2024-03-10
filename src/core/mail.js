const nodemailer = require('nodemailer');
const config = require('config');

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

const sendMail = async ({ to, subject, text }, callback = () => {}) => {
  const mailOptions = { ...from, to, subject, text };
  await transporter.sendMail(mailOptions, callback);
};

module.exports = {
  sendMail,
};
