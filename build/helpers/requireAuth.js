"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const requireAuth = accessToken => {
  if (accessToken && accessToken.length === 16) {
    return true;
  }
  return false;
};

exports.default = requireAuth;
//# sourceMappingURL=requireAuth.js.map