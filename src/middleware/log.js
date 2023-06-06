const logRequest = (req, res, next) => {
  console.log(`request on ${req.path}`);
  next();
};

module.exports = logRequest;
