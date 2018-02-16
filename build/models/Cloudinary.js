'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadProfileImage = exports.uploadCampaignImage = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _cloudinary = require('cloudinary');

var _cloudinary2 = _interopRequireDefault(_cloudinary);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = _dotenv2.default.config().parsed;

_cloudinary2.default.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET
});

const uploadCampaignImage = exports.uploadCampaignImage = (image, options, success, error) => {
  _cloudinary2.default.uploader.upload_stream(response => 'error' in response ? error(response.error) : success(response), _extends({
    crop: 'fill'
  }, options)).end(image.buffer);
};

const uploadProfileImage = exports.uploadProfileImage = (image, options, success, error) => {
  _cloudinary2.default.uploader.upload_stream(response => 'error' in response ? error(response.error) : success(response), _extends({
    crop: 'fill',
    gravity: 'face',
    width: 198,
    height: 198
  }, options)).end(image.buffer);
};
//# sourceMappingURL=Cloudinary.js.map