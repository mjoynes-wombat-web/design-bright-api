"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const jsonResponse = (statusCode, data, message, res) => {
  const response = {
    statusCode,
    data,
    message
  };
  return res.status(response.statusCode).json(response);
};

exports.default = jsonResponse;
//# sourceMappingURL=response.js.map