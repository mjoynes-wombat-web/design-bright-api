'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _users = require('./routes/users');

var _users2 = _interopRequireDefault(_users);

var _nonprofits = require('./routes/nonprofits');

var _nonprofits2 = _interopRequireDefault(_nonprofits);

var _campaigns = require('./routes/campaigns');

var _campaigns2 = _interopRequireDefault(_campaigns);

var _advisor = require('./routes/advisor');

var _advisor2 = _interopRequireDefault(_advisor);

var _help = require('./routes/help');

var _help2 = _interopRequireDefault(_help);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Grabbing Environment Variables
const { API_PORT = 3000, STATUS, HOST = '0.0.0.0', PRIVATE_KEY_FILE, CERTIFICATE_FILE } = _dotenv2.default.config().parsed;

// Setting up the express application.


// Import Routes
// Import Dependencies
const app = (0, _express2.default)();

// Setting the morgan logger to the development status if it exists
if (STATUS !== undefined) {
  app.use((0, _morgan2.default)(STATUS));
}
app.use((0, _compression2.default)());

const whitelist = ['https://192.168.86.200:3002', 'https://192.168.1.9:3002', 'https://165.227.7.212', 'https://www.designbright.org', 'https://designbright.org', 'https://192.168.33.129:3002'];

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use((0, _cors2.default)(corsOptions));

app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: false }));

// Setting up the API routes.
app.use('/api/users', _users2.default);
app.use('/api/nonprofits', _nonprofits2.default);
app.use('/api/campaigns', _campaigns2.default);
app.use('/api/advisor', _advisor2.default);
app.use('/api/help', _help2.default);

_https2.default.createServer({
  key: _fs2.default.readFileSync(PRIVATE_KEY_FILE),
  cert: _fs2.default.readFileSync(CERTIFICATE_FILE)
}, app).listen(API_PORT, HOST, () => {
  console.log(`Design Bright API running on ${HOST}:${API_PORT}.`);
});
//# sourceMappingURL=app.js.map