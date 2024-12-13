const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  console.log(req)
  const token = req.cookies.token || req.cookies.access_token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized access, token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request object
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

module.exports = { authenticateJWT };
