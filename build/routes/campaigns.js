'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // Create API Users Router


var _express = require('express');

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _stripe = require('stripe');

var _stripe2 = _interopRequireDefault(_stripe);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _Auth = require('../models/Auth0');

var _campaigns = require('../models/campaigns');

var _response = require('../helpers/response');

var _response2 = _interopRequireDefault(_response);

var _Cloudinary = require('../models/Cloudinary');

var _requireAuth = require('../helpers/requireAuth');

var _requireAuth2 = _interopRequireDefault(_requireAuth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const upload = (0, _multer2.default)();
const router = (0, _express.Router)();

const { STRIPE_SECRET } = _dotenv2.default.config().parsed;

const stripe = (0, _stripe2.default)(STRIPE_SECRET);

/*
******CAMPAIGN ROUTES******
*/

// Returns the list of campaigns based on the search as sort queries.
router.get('/', (req, res) => {
  if (Object.keys(req.query).length > 0) {
    let search;
    let sort;
    let page;
    if (req.query.page) {
      search = req.query.search;
      sort = req.query.sort;
      page = req.query.page;
    } else {
      search = req.query.search;
      sort = req.query.sort;
      page = 1;
    }
    if (sort) {
      return (0, _campaigns.getCampaigns)({
        page,
        search,
        sort
      }, getCampaignsResults => (0, _response2.default)(getCampaignsResults.statusCode, getCampaignsResults, getCampaignsResults.message, res), getCampaignsErr => (0, _response2.default)(getCampaignsErr.statusCode, getCampaignsErr, getCampaignsErr.message, res));
    }
    return (0, _response2.default)(400, {
      search,
      sort,
      page
    }, 'You are missing the sort method.', res);
  }
  return (0, _response2.default)(400, {}, 'There were no queries provided.', res);
});

// Returns the information for the campaign with the identity param.
router.get('/:campaignId', (req, res) => {
  const id = req.params.campaignId;
  (0, _campaigns.getCampaignContent)(id, results => {
    if (results.campaignInfo.startDate) {
      return (0, _response2.default)(200, results, `This is the contents for the campaign id ${id}`, res);
    } else if ('accessToken' in req.query) {
      (0, _Auth.getUserInfo)(req.query.accessToken, user => {
        if (parseInt(user.app_metadata.nonProfitID, 10) === results.campaignInfo.nonprofitId) {
          return (0, _response2.default)(200, results, `This is the preview contents for the the campaign id ${id}`, res);
        }
        return (0, _response2.default)(401, {}, `You aren't authorize to preview the campaign id ${id}`, res);
      }, error => (0, _response2.default)(error.statusCode, error.original, 'There was an error getting the user info.', res));
    } else {
      return (0, _response2.default)(401, {}, 'There was no access token provided.', res);
    }
    return null;
  }, error => {
    if (Object.keys(error).length) {
      return (0, _response2.default)(500, error, 'There was an error on the server.', res);
    }
    return (0, _response2.default)(404, error, 'You are trying to access a campaign that doesn\'t exist.', res);
  });
});

// Accepts information changes to a campaign with the campaignId param.
// Returns the update campaign information.
router.patch('/edit/:campaignId', (req, res) => {
  const getCampaignId = parseInt(req.params.campaignId, 10);
  const { accessToken, campaignInfo, campaignContent } = req.body;
  (0, _Auth.getUserInfo)(accessToken, user => {
    const nonprofitId = parseInt(user.app_metadata.nonProfitID, 10);
    if (campaignInfo.nonprofitId === nonprofitId) {
      (0, _campaigns.getCampaignById)(getCampaignId, getCampaignInfoResults => {
        if (getCampaignInfoResults.nonprofitId === nonprofitId) {
          return (0, _campaigns.createContent)(getCampaignId, campaignContent, createContentResults => {
            if (getCampaignInfoResults.startDate === null) {
              return (0, _campaigns.updateCampaignInfo)(nonprofitId, campaignInfo, updateCampaignInfoResults => (0, _response2.default)(updateCampaignInfoResults.statusCode, updateCampaignInfoResults, 'The campaign changes were successfully saved.', res), updateCampaignInfoErr => (0, _response2.default)(updateCampaignInfoErr.statusCode, updateCampaignInfoErr, updateCampaignInfoErr.message, res));
            }
            return (0, _response2.default)(200, createContentResults, 'The campaign content was successfully saved.', res);
          }, createContentError => (0, _response2.default)(304, createContentError, 'The was an error saving the campaign content.', res));
        }
        return (0, _response2.default)(401, {
          nonprofitId,
          campaignId: getCampaignId
        }, 'You are not authorized to edit this campaign.', res);
      }, getCampaignError => (0, _response2.default)(getCampaignError.code, getCampaignError, `The campaign with the id ${getCampaignId} could not be found.`, res));
    }
  }, error => (0, _response2.default)(error.statusCode, error.original, 'There was an error getting the user info.', res));
});

router.post('/upload/photo/:campaignId', upload.single('file'), (req, res) => {
  const id = req.params.campaignId;
  const { campaignName, imageType, imageAlt, nonprofitId } = req.body;
  const image = req.file;

  const imageDimensions = imgType => {
    switch (imgType) {
      case 'main':
        return { width: 1440, height: 820 };
      case 'left':
        return { width: 235, height: 290 };
      case 'right':
        return { width: 235, height: 290 };
      default:
        return { width: 235, height: 290 };
    }
  };

  const dimensions = imageDimensions(imageType);
  const originalName = image.originalname;
  const fileName = `${originalName.substring(0, originalName.lastIndexOf('.'))}-campaignId${id}-${new Date().toISOString()}`;

  (0, _Cloudinary.uploadCampaignImage)(image, _extends({
    public_id: fileName,
    folder: nonprofitId
  }, dimensions, {
    tags: [id, 'campaign-image', campaignName, imageAlt]
  }), success => (0, _response2.default)(200, success, 'Image created successfully.', res), error => (0, _response2.default)(error.http_code, error, error.message, res));
});

// Accepts a new campaign information. Returns the new created campaign.
router.post('/create', (req, res) => {
  const { newCampaign, accessToken } = req.body;
  if ((0, _requireAuth2.default)(accessToken)) {
    (0, _Auth.getUserInfo)(accessToken, user => {
      const nonprofitId = user.app_metadata.nonProfitID;

      (0, _campaigns.createCampaign)(nonprofitId, newCampaign, createCamapignResults => (0, _response2.default)(createCamapignResults.statusCode, createCamapignResults, 'Your campaign was successfully created.', res), createCampaignErr => (0, _response2.default)(createCampaignErr.statusCode, createCampaignErr.error, createCampaignErr.message, res));
    }, getUserInfoErr => (0, _response2.default)(getUserInfoErr.statusCode, getUserInfoErr.original, 'There was an error getting the user info.', res));
  } else {
    (0, _response2.default)(401, { accessToken }, 'The access token is not a valid access token.', res);
  }
});

router.post('/donate/:id', (req, res) => {
  const { id } = req.params;
  const { email, token, amount, description, userInfo } = req.body;

  const charge = () => {
    if (email) {
      return {
        receipt_email: email,
        source: token.id,
        amount,
        description,
        currency: 'usd',
        metadata: {
          campaignId: id,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email,
          userType: userInfo.userType
        }
      };
    }
    return {
      source: token.id,
      amount,
      description,
      currency: 'usd',
      metadata: {
        campaignId: id,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        userType: userInfo.userType
      }
    };
  };

  stripe.charges.create(charge()).then(chargeConf => {
    if (chargeConf.paid) {
      const amountCharged = chargeConf.amount.toString();
      return (0, _campaigns.donateToCampaign)(id, amount, donateResults => (0, _response2.default)(donateResults.code, _extends({}, donateResults.data, {
        databaseMessage: donateResults.message
      }), `Your donation of $${amountCharged.slice(0, amountCharged.length - 2)}.${amountCharged.slice(-2)} was successfully made.`, res), getCampaignErr => (0, _response2.default)(getCampaignErr.code, { error: getCampaignErr.error }, getCampaignErr.message, res));
    }
    return (0, _response2.default)(400, { error: chargeConf }, 'There was an error processing your payment.', res);
  }).catch(chargeErr => {
    (0, _response2.default)(chargeErr.statusCode, { error: chargeErr }, chargeErr.message, res);
  });
});

// Exporting router as default.
exports.default = router;
//# sourceMappingURL=campaigns.js.map