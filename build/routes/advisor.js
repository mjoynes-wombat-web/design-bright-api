'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _response = require('../helpers/response');

var _response2 = _interopRequireDefault(_response);

var _advisor = require('../models/advisor');

var _advisor2 = _interopRequireDefault(_advisor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();

/*
******ADVISOR ROUTES******
*/

// Accepts a new advisor request. Returns a confirmation message.
// Create API Users Router
router.post('/create', (req, res) => {
  (0, _advisor2.default)(req.body, createAdvisorResults => (0, _response2.default)(createAdvisorResults.statusCode, createAdvisorResults, createAdvisorResults.message, res), createAdvisorErr => (0, _response2.default)(createAdvisorErr.statusCode, createAdvisorErr, createAdvisorErr.message, res));
});

// Exporting router as default.
exports.default = router;
//# sourceMappingURL=advisor.js.map