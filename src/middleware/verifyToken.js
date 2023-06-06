const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];
  console.log(authHeaders);
  console.log(token);

  if (token == null) {
    return res.status(401).json({
      ok: false,
      message: "token unauthorized",
    });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        ok: false,
        message: "Forbidden response",
      });
    }
    req.username = decoded.username;
    req.email = decoded.email;
    next();
  });
};

module.exports = verifyToken;
