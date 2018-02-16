'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.editNonProfit = exports.addNonProfit = exports.findNonProfitByID = exports.findNonProfitByEIN = undefined;

var _db = require('./db');

var db = _interopRequireWildcard(_db);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const findNonProfitByEIN = exports.findNonProfitByEIN = (ein, success, error) => {
  db.nonProfits.find({ where: { ein } }).then(results => success(results)).catch(err => error(err));
};

const findNonProfitByID = exports.findNonProfitByID = (nonprofitId, success, error) => {
  db.nonProfits.find({ where: { nonprofitId } }).then(results => success(results)).catch(err => error(err));
};

const addNonProfit = exports.addNonProfit = (nonProfitData, success, error) => {
  findNonProfitByEIN(nonProfitData.ein, findResults => {
    if (findResults !== null) {
      const nonProfit = findResults;
      nonProfit.status = 200;
      return success(nonProfit);
    }
    db.nonProfits.create(nonProfitData).then(createResults => {
      const nonProfit = createResults;
      nonProfit.status = 201;
      return success(nonProfit);
    }).catch(createError => error(createError));
    return null;
  }, error);
};

const editNonProfit = exports.editNonProfit = (nonprofitId, updateData, success, error) => {
  db.nonProfits.update(updateData, {
    where: {
      nonprofitId
    }
  }).then(recordsAffected => {
    if (recordsAffected[0] === 0) {
      return error(recordsAffected, 'There were no records updated.');
    }
    db.nonProfits.find({ where: { nonprofitId } }).then(results => {
      const updatedNonProfit = results;
      updatedNonProfit.status = 200;
      return success(updatedNonProfit, 'The nonprofit info was updated successfully.');
    }).catch(findUpdated => error(findUpdated, 'Couldn\'t find the updated nonprofit.'));
  }).catch(updateError => error(updateError, 'The update was unable to complete.'));
};
//# sourceMappingURL=nonprofits.js.map