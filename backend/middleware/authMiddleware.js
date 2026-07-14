const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the user information to the request object
    req.user = decoded;
    
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired. Please login again.' 
      });
    }
    return res.status(403).json({ 
      message: 'Invalid token.' 
    });
  }
};

module.exports = authenticateToken;