const requireAuth = (accessToken) => {
  if (accessToken && accessToken.length === 16) {
    return true;
  }
  return false;
};

export default requireAuth;
