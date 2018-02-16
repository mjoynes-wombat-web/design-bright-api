const jsonResponse = (statusCode, data, message, res) => {
  const response = {
    statusCode,
    data,
    message,
  };
  return res.status(response.statusCode).json(response);
};

export default jsonResponse;
