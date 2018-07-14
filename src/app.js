// Import Dependencies
import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import BodyParser from 'body-parser';
import fs from 'fs';
import https from 'https';
import compression from 'compression';

// Import Routes
import users from './routes/users';
import nonprofits from './routes/nonprofits';
import campaigns from './routes/campaigns';
import advisor from './routes/advisor';

// Grabbing Environment Variables
const { API_PORT = 3000, STATUS, HOST = '0.0.0.0', PRIVATE_KEY_FILE, CERTIFICATE_FILE } = dotenv.config().parsed;


// Setting up the express application.
const app = express();

// Setting the morgan logger to the development status if it exists
if (STATUS !== undefined) {
  app.use(logger(STATUS));
}
app.use(compression());

const whitelist = [
  'https://192.168.86.200:3002',
  'https://192.168.86.200:3000',
  'http://192.168.86.200:3002',
  'https://192.168.1.9:3002',
  'https://165.227.7.212',
  'https://www.designbright.org',
  'https://designbright.org',
  'https://192.168.33.129:3002',
  'http://10.239.236.134:3002',
  'http://localhost:3002',
  'http://localhost:8000',
  'https://ssmith-wombatweb.github.io',
  'https://www.simeonsmith.me',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));

// Setting up the API routes.
app.use('/api/users', users);
app.use('/api/nonprofits', nonprofits);
app.use('/api/campaigns', campaigns);
app.use('/api/advisor', advisor);

https.createServer({
  key: fs.readFileSync(PRIVATE_KEY_FILE),
  cert: fs.readFileSync(CERTIFICATE_FILE),
}, app).listen(API_PORT, HOST, () => {
  console.log(`Design Bright API running on ${HOST}:${API_PORT}.`);
},
);
