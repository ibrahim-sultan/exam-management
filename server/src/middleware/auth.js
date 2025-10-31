import jwt from 'jsonwebtoken';

export function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No authorization header' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
