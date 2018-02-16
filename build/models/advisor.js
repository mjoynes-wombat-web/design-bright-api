'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAdvisor = undefined;

var _db = require('./db');

var db = _interopRequireWildcard(_db);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const createAdvisor = exports.createAdvisor = ({ email, firstName, lastName, position, yearsExperience }, success, error) => {
  db.advisors.create({
    email,
    firstName,
    lastName,
    position,
    advisorStatus: 'pending',
    yearsExperience
  }).then(createAdvisorResults => success({
    statusCode: 200,
    createAdvisorResults,
    message: 'You request to become an advisor has been submitted.'
  })).catch(createAdvisorErr => {
    if (createAdvisorErr.errors[0].type === 'unique violation') {
      return error({
        statusCode: 409,
        error: createAdvisorErr,
        message: 'The email you provided has already been used.'
      });
    }
    return error({
      statusCode: 500,
      error: createAdvisorErr,
      message: 'There was an error submitting your request. Please try again.'
    });
  });
};

exports.default = createAdvisor;
//# sourceMappingURL=advisor.js.map