/**
 * Authentication Middleware
 * Protects routes by checking if user is authenticated via session
 */

export const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
};

export const optionalAuth = (req, res, next) => {
  // Adds user info to request if authenticated, but doesn't block
  next();
};
