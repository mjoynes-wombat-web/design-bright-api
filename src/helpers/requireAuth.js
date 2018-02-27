const requireAuth = (accessToken) => {
  if (accessToken) {
    return true;
  }
  return false;
};

export default requireAuth;
