// Create API Users Router
import { Router } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

import jsonReponse from '../helpers/response';

const router = Router();

const { EMAIL_PASS } = dotenv.config().parsed;

/*
******HELP ROUTES******
*/

// Accepts a help contact request. Returns a confirmation message.
router.post('/', (req, res) => {
  const { firstName, lastName, email, message, subject } = req.body;
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 465,
    secure: true,
    auth: {
      user: 'ssmith@wombatweb.us',
      pass: EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const emailNum = (emailAddr) => {
    const alpha = 'abcdefghijklmnopqrstuvwxyz@.ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&\'*+-/=?^_`{|}~"(),:;<>@[\\]'.split('');
    let num = '';
    const emailArr = emailAddr.split('');

    for (let i = 0; i < emailArr.length; i += 1) {
      if (emailArr.indexOf('@') > i) {
        num += alpha.indexOf(emailArr[i]).toString();
      } else {
        return num;
      }
    }
    return num;
  };

  const supportId = `${emailNum(email)}${(new Date().valueOf())}`;

  const helpRequestMessage = {
    from: 'noreply@designbright.org',
    to: 'ssmith@wombatweb.us',
    subject: `Help Request #${supportId} - ${subject}`,
    text: `
A support request for www.designbright.org has been submitted.

Name: ${firstName} ${lastName}
Email: ${email}

Message:
${message}

Thank you,
Design Bright Support
    `,
  };

  transporter.sendMail(
    helpRequestMessage,
    (requestMsgErr, requestMsgInfo) => {
      if (requestMsgErr) {
        return jsonReponse(
          requestMsgErr.responseCode,
          requestMsgErr,
          'There was an error sending your support request. Please send an email to help@designbright.org',
          res);
      } else if (requestMsgInfo) {
        const helpConfirmMessage = {
          from: 'help@designbright.org',
          to: [email],
          subject: `Help Request #${supportId} - ${subject}`,
          text: `
Hello ${firstName} ${lastName},

We have received the request below for help. We look forward to helping you. Please allow 24-48 hours for a response. 

Help Request:
${message}

Thank you,
Design Bright Support
          `,
        };

        return transporter.sendMail(
          helpConfirmMessage,
          (confirmMsgErr, confirmMsgInfo) => {
            if (confirmMsgErr) {
              return jsonReponse(
                confirmMsgErr.responseCode,
                confirmMsgErr,
                'Your support request failed. Please email help@designbright.org',
                res);
            } else if (confirmMsgInfo) {
              return jsonReponse(
                200,
                confirmMsgInfo,
                'You support request was successfully sent.',
                res);
            }
            return jsonReponse(
              404,
              {},
              'Your support request failed. Please email help@designbright.org',
              res);
          },
        );
      }
      return jsonReponse(
        404,
        {},
        'Your support request failed. Please email help@designbright.org',
        res);
    },
  );
});

// Exporting router as default.
export default router;
