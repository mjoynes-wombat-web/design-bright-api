import axios from 'axios';
import dotenv from 'dotenv';
import auth0 from 'auth0-js';

const { AUTH0_API_ID, AUTH0_API_SECRET, AUTH0_DOMAIN, AUTH0_CLIENT_ID } = dotenv.config().parsed;

const clientWebAuth = new auth0.WebAuth({
  domain: AUTH0_DOMAIN,
  clientID: AUTH0_CLIENT_ID,
});


export const createNewUser = (
  { email, password, user_metadata, app_metadata },
  success,
  error,
) => {
  axios.post(
    'https://designbright.auth0.com/oauth/token',
    {
      client_id: AUTH0_API_ID,
      client_secret: AUTH0_API_SECRET,
      audience: 'https://designbright.auth0.com/api/v2/',
      grant_type: 'client_credentials',
    },
    { 'content-type': 'application/json' })
    .then((results) => {
      axios.post(
        'https://designbright.auth0.com/api/v2/users',
        {
          connection: 'Username-Password-Authentication',
          email,
          name: email,
          password,
          user_metadata,
          app_metadata: {
            userType: app_metadata.userType,
            nonProfitID: app_metadata.nonProfitID,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${results.data.access_token}`,
            'content-type': 'application/json',
          },
        })
        .then(newUser => success(newUser))
        .catch(userErr => error(userErr));
    })
    .catch(authErr => error(authErr));
};

export const editUserInfo = (
  userId,
  updatedUserInfo,
  success,
  error) => {
  const userInfo = updatedUserInfo;

  if (userInfo.password) {
    userInfo.user_metadata.passwordDate = new Date();
  } else {
    delete userInfo.password;
  }

  userInfo.connection = 'Username-Password-Authentication';

  axios.post(
    'https://designbright.auth0.com/oauth/token',
    {
      client_id: AUTH0_API_ID,
      client_secret: AUTH0_API_SECRET,
      audience: 'https://designbright.auth0.com/api/v2/',
      grant_type: 'client_credentials',
    },
    { 'content-type': 'application/json' })
    .then((results) => {
      if ('password' in userInfo) {
        axios.patch(
          `https://designbright.auth0.com/api/v2/users/${userId}`,
          { password: userInfo.password },
          {
            headers: {
              Authorization: `Bearer ${results.data.access_token}`,
              'content-type': 'application/json',
            },
          })
          .catch(userErr => error(userErr));

        delete userInfo.password;
      }
      axios.patch(
        `https://designbright.auth0.com/api/v2/users/${userId}`,
        userInfo,
        {
          headers: {
            Authorization: `Bearer ${results.data.access_token}`,
            'content-type': 'application/json',
          },
        })
        .then(newUser => success(newUser))
        .catch(userErr => error(userErr));
    })
    .catch(authErr => error(authErr));
};

export const getUserInfo = (accessToken, callback, error) => {
  clientWebAuth.client.userInfo(accessToken, (userErr, user) => {
    if (userErr) {
      return error(userErr);
    }
    return callback(user);
  });
};
