const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    console.log('Role check:', {
      userRole: req.user.role,
      requiredRole,
      match: req.user.role === requiredRole
    });
    
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        error: 'Forbidden',
        userRole: req.user.role,
        requiredRole 
      });
    }
    next();
  };
};

module.exports = roleMiddleware;
