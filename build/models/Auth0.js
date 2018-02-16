'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUserInfo = exports.editUserInfo = exports.createNewUser = undefined;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _auth0Js = require('auth0-js');

var _auth0Js2 = _interopRequireDefault(_auth0Js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { AUTH0_API_ID, AUTH0_API_SECRET, AUTH0_DOMAIN, AUTH0_CLIENT_ID } = _dotenv2.default.config().parsed;

const clientWebAuth = new _auth0Js2.default.WebAuth({
  domain: AUTH0_DOMAIN,
  clientID: AUTH0_CLIENT_ID
});

const createNewUser = exports.createNewUser = ({ email, password, user_metadata, app_metadata }, success, error) => {
  _axios2.default.post('https://designbright.auth0.com/oauth/token', {
    client_id: AUTH0_API_ID,
    client_secret: AUTH0_API_SECRET,
    audience: 'https://designbright.auth0.com/api/v2/',
    grant_type: 'client_credentials'
  }, { 'content-type': 'application/json' }).then(results => {
    _axios2.default.post('https://designbright.auth0.com/api/v2/users', {
      connection: 'Username-Password-Authentication',
      email,
      name: email,
      password,
      user_metadata,
      app_metadata: {
        userType: app_metadata.userType,
        nonProfitID: app_metadata.nonProfitID
      }
    }, {
      headers: {
        Authorization: `Bearer ${results.data.access_token}`,
        'content-type': 'application/json'
      }
    }).then(newUser => success(newUser)).catch(userErr => error(userErr));
  }).catch(authErr => error(authErr));
};

const editUserInfo = exports.editUserInfo = (userId, updatedUserInfo, success, error) => {
  const userInfo = updatedUserInfo;

  if (userInfo.password) {
    userInfo.user_metadata.passwordDate = new Date();
  } else {
    delete userInfo.password;
  }

  userInfo.connection = 'Username-Password-Authentication';

  _axios2.default.post('https://designbright.auth0.com/oauth/token', {
    client_id: AUTH0_API_ID,
    client_secret: AUTH0_API_SECRET,
    audience: 'https://designbright.auth0.com/api/v2/',
    grant_type: 'client_credentials'
  }, { 'content-type': 'application/json' }).then(results => {
    if ('password' in userInfo) {
      _axios2.default.patch(`https://designbright.auth0.com/api/v2/users/${userId}`, { password: userInfo.password }, {
        headers: {
          Authorization: `Bearer ${results.data.access_token}`,
          'content-type': 'application/json'
        }
      }).catch(userErr => error(userErr));

      delete userInfo.password;
    }
    _axios2.default.patch(`https://designbright.auth0.com/api/v2/users/${userId}`, userInfo, {
      headers: {
        Authorization: `Bearer ${results.data.access_token}`,
        'content-type': 'application/json'
      }
    }).then(newUser => success(newUser)).catch(userErr => error(userErr));
  }).catch(authErr => error(authErr));
};

const getUserInfo = exports.getUserInfo = (accessToken, callback, error) => {
  clientWebAuth.client.userInfo(accessToken, (userErr, user) => {
    if (userErr) {
      return error(userErr);
    }
    return callback(user);
  });
};
//# sourceMappingURL=Auth0.js.map