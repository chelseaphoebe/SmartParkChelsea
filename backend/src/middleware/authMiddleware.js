const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const userId = payload.userId || payload.id;

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'User not found' });

    console.log('Auth middleware - User found:', {
      id: user._id,
      email: user.email,
      role: user.role,
      roleType: typeof user.role
    });

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
