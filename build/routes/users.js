'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _nonprofits = require('../models/nonprofits');

var _Auth = require('../models/Auth0');

var _response = require('../helpers/response');

var _response2 = _interopRequireDefault(_response);

var _Cloudinary = require('../models/Cloudinary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Create API Users Router
const upload = (0, _multer2.default)();
const router = (0, _express.Router)();

/*
******USER ROUTES******
*/

// Accepts a new user information. Returns a confirmation message.
router.post('/create', (req, res) => {
  if (req.body.userInfo.app_metadata.userType === 'non-profit') {
    const NonProfit = ({ name, ein, address, city, state, zip }) => ({
      name,
      ein,
      address,
      city,
      state,
      zip
    });
    const newNonProfit = NonProfit(req.body.nonProfitInfo);
    (0, _nonprofits.addNonProfit)(newNonProfit, nonprofit => {
      const newUser = req.body.userInfo;
      newUser.app_metadata.nonProfitID = String(nonprofit.dataValues.nonprofitId);
      (0, _Auth.createNewUser)(newUser, createdUser => {
        const newUserData = createdUser.data;
        return (0, _response2.default)(201, newUserData, 'Your user was successfully created.', res);
      }, error => {
        const { statusCode, message } = error.response.data;

        return (0, _response2.default)(statusCode, newUser.email, message, res);
      });
      // If user fails delete non-profit if new.
    }, addNonProfitError => (0, _response2.default)(500, addNonProfitError, 'There was an error adding the non-profit to the database.'));
  } else {
    const newUser = req.body.userInfo;
    newUser.app_metadata.nonProfitID = '';
    (0, _Auth.createNewUser)(newUser, createdUser => {
      const newUserData = createdUser.data;
      return (0, _response2.default)(201, newUserData, 'Your user was successfully created.', res);
    }, error => {
      const { statusCode, message } = error.response.data;

      return (0, _response2.default)(statusCode, { email: newUser.email }, message, res);
    });
  }
});

router.patch('/upload/photo', upload.single('file'), (req, res) => {
  const { accessToken } = req.body;
  const image = req.file;
  const originalName = image.originalname;

  (0, _Auth.getUserInfo)(accessToken, user => {
    const fileName = `${originalName.substring(0, originalName.lastIndexOf('.'))}-${user.email}-${new Date().toISOString()}`;
    (0, _Cloudinary.uploadProfileImage)(image, {
      public_id: fileName,
      folder: `profile/${user.email}`,
      tags: [user.email, 'profile-image']
    }, uploadSuccess => {
      (0, _Auth.editUserInfo)(user.user_id, {
        user_metadata: {
          picture: uploadSuccess.secure_url
        }
      }, editUserRes => (0, _response2.default)(editUserRes.status, { picture: editUserRes.data.user_metadata.picture }, 'You have successfully uploaded the picture.', res), editUserErr => (0, _response2.default)(500, editUserErr, 'There was an error uploading the user picture.', res));
    }, uploadErr => (0, _response2.default)(500, uploadErr, 'There was an error uploading the user picture.', res));
  }, findUserError => (0, _response2.default)(findUserError.statusCode, findUserError.original, 'This access token is not authorized.', res));
});

// Accepts new information for the user with the userId param.
// Returns the updated user information. Requires authorization.
router.patch('/edit', (req, res) => {
  const { accessToken, editData } = req.body;
  const updatedUserInfo = editData.userInfo;
  (0, _Auth.getUserInfo)(accessToken, user => {
    (0, _Auth.editUserInfo)(user.user_id, updatedUserInfo, editUserResponse => {
      const updatedUser = editUserResponse.data;
      if (updatedUser.app_metadata.userType === 'non-profit') {
        const nonprofitId = updatedUser.app_metadata.nonProfitID;
        const updatedNonProfitInfo = editData.nonProfitInfo;
        (0, _nonprofits.editNonProfit)(nonprofitId, updatedNonProfitInfo, updatedNonProfit => (0, _response2.default)(200, {
          updatedUser,
          updatedNonProfit
        }, `${updatedUser.email.charAt(0).toUpperCase()}${updatedUser.email.slice(1)} has been updated.`, res), editNonProfitError => (0, _response2.default)(500, { editNonProfitError }, 'There was an error editing the nonprofit. Please contact support.', res));
      }
      return (0, _response2.default)(200, { updatedUser }, `${updatedUserInfo.email.charAt(0).toUpperCase()}${updatedUserInfo.email.slice(1)} has been updated`, res);
    }, editUserError => {
      if (editUserError.response.data.message === 'The specified new email already exists') {
        return (0, _response2.default)(409, { userId: user.user_id }, `${updatedUserInfo.email.charAt(0).toUpperCase()}${updatedUserInfo.email.slice(1)} is already in use.`, res);
      }
      return (0, _response2.default)(editUserError.response.status, { userId: user.user_id }, editUserError.response.data.message, res);
    });
  }, findUserError => {
    if (findUserError.status === 401) {
      return (0, _response2.default)(findUserError.status, findUserError.Error, 'This access token is not authorized.', res);
    }
    return (0, _response2.default)(findUserError.status, findUserError.Error, 'Unknown error. Please contact support.', res);
  });
});

// Exporting router as default.
exports.default = router;
//# sourceMappingURL=users.js.map