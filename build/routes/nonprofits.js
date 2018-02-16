'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _nonprofits = require('../models/nonprofits');

var _Auth = require('../models/Auth0');

var _campaigns = require('../models/campaigns');

var _response = require('../helpers/response');

var _response2 = _interopRequireDefault(_response);

var _requireAuth = require('../helpers/requireAuth');

var _requireAuth2 = _interopRequireDefault(_requireAuth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();

router.post('/create', (req, res) => {
  (0, _nonprofits.addNonProfit)(req.body, results => {
    res.status(results.status).json(results);
  }, error => {
    res.json(error);
  });
});

router.get('/:accessToken', (req, res) => {
  const accessToken = req.params.accessToken;
  if ((0, _requireAuth2.default)(accessToken)) {
    (0, _Auth.getUserInfo)(accessToken, user => {
      const nonprofitId = user.app_metadata.nonProfitID;
      (0, _nonprofits.findNonProfitByID)(nonprofitId, results => results === null ? (0, _response2.default)(404, { nonprofitId }, 'This account belongs to a non-profit that doesn\'t exist. Please contact support.', res) : (0, _response2.default)(200, results.dataValues, `You have successfully retrieved the nonprofit's info that has the id of ${user.app_metadata.nonProfitID}.`, res), error => (0, _response2.default)(500, error, 'There was an issue retrieving the non-profit information from the database. Please contact support.', res));
    }, error => (0, _response2.default)(error.statusCode, error.original, 'There was an error getting the user info.', res));
  } else {
    (0, _response2.default)(401, { accessToken }, 'The access token is not a valid access token.', res);
  }
});

router.patch('/campaigns/launch/:campaignId', (req, res) => {
  const id = req.params.campaignId;
  const accessToken = req.body.accessToken;
  if ((0, _requireAuth2.default)(accessToken)) {
    (0, _Auth.getUserInfo)(accessToken, userInfo => (0, _campaigns.launchCampaign)(id, userInfo.nonProfitID, launchResults => launchResults[0] === 0 ? (0, _response2.default)(304, launchResults, 'Could not start the campaign. Either it doesn\'t exists or is already started.', res) : (0, _response2.default)(200, launchResults, 'You have successfully started your campaign.', res), launchErr => (0, _response2.default)(500, launchErr, 'There was an server error launching the campiagn.', res)), getUserErr => (0, _response2.default)(404, getUserErr, 'There was an error getting the user info.', res));
  } else {
    (0, _response2.default)(401, { accessToken }, 'This access token is not authorized.', res);
  }
});

router.patch('/campaigns/stop/:campaignId', (req, res) => {
  const id = req.params.campaignId;
  const accessToken = req.body.accessToken;
  if ((0, _requireAuth2.default)(accessToken)) {
    (0, _Auth.getUserInfo)(accessToken, userInfo => (0, _campaigns.stopCampaign)(id, userInfo.nonProfitID, stopResults => stopResults[0] === 0 ? (0, _response2.default)(304, stopResults, 'Could not stop the campaign. Either it doesn\'t exists, hasn\'t been started or is already stopped.', res) : (0, _response2.default)(200, stopResults, 'You have successfully stopped your campaign.', res), stopErr => (0, _response2.default)(500, stopErr, 'There was an server error stopping the campaign.', res)), getUserErr => (0, _response2.default)(404, getUserErr, 'There was an error getting the user info.', res));
  } else {
    (0, _response2.default)(401, { accessToken }, 'The access token is not a valid access token.', res);
  }
});

router.get('/campaigns/:accessToken', (req, res) => {
  const accessToken = req.params.accessToken;
  if ((0, _requireAuth2.default)(accessToken)) {
    (0, _Auth.getUserInfo)(accessToken, user => {
      const nonprofitId = user.app_metadata.nonProfitID;
      (0, _nonprofits.findNonProfitByID)(nonprofitId, nonprofit => {
        (0, _campaigns.getNonprofitsCampaigns)(nonprofitId, campaigns => (0, _response2.default)(200, { nonprofit, campaigns }, `The campaigns were successfully retrieved for the nonprofit with the id ${nonprofitId}.`, res), error => (0, _response2.default)(404, error, `Could not find campaigns for the nonprofit with the id ${nonprofitId}.`, res));
      }, error => (0, _response2.default)(404, error, `Could not find campaigns for the nonprofit with the id ${nonprofitId}.`, res));
    }, error => (0, _response2.default)(error.statusCode, error.original, 'There was an error getting the user info.', res));
  } else {
    (0, _response2.default)(401, { accessToken }, 'The access token is not a valid access token.', res);
  }
});

exports.default = router;
//# sourceMappingURL=nonprofits.js.map