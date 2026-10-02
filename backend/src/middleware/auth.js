import { verifyToken } from "../utils/jwt.js";

export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ detail: "Missing token" });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ detail: "Invalid or expired token" });
  req.user = payload;
  next();
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ detail: "Insufficient permissions" });
    }
    next();
  };
}