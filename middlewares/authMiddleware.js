module.exports = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });
  
    // Logic to verify the token (e.g., using JWT)
    next();
  };
  