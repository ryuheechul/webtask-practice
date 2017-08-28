'use latest';

import express from 'express';
import { fromExpress } from 'webtask-tools';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
const app = express();

const getTransporter = (ctx) => {
  return nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: ctx.secrets.GMAIL_ID,
      pass: ctx.secrets.GMAIL_PW
    }
  });
};

const html = `
<h1>Let\'s preview and plan your productive day!</h1>
Open your <a href="https://calendar.google.com">Google Calendar</a> to do it!
`;

const getMailOptions = (ctx) => {
  return {
    from: "Robin <" + ctx.secrets.GMAIL_ID + ">",
    to: ctx.meta.THE_USER_EMAIL,
    subject: 'Preview your day!',
    html: html
  }
};

app.use(bodyParser.json());

app.get('/', (req, res) => {
  const ctx = req.webtaskContext;
  const smtpTransport = getTransporter(ctx);
  const mailOptions = getMailOptions(ctx);
  
  res.set('Content-Type', 'text/html');
  
  smtpTransport.sendMail(mailOptions, function(error, response){
    if (error){
      console.log(error);
      res.status(401).send('failed to login');
    } else {
      console.log("Message sent : " + response.message);
      res.set('Content-Type', 'text/html');
      res.status(200).send('success');
    }
    smtpTransport.close();
  });
});

module.exports = fromExpress(app);