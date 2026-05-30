import jwt from "jsonwebtoken";
import { fail } from "../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET || "flowershop-secret-key";

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return fail(res, "Требуется авторизация", 401);
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return fail(res, "Недействительный токен", 401);
  }
}

export function optionalToken(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(header.slice(7), JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}

export function checkRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return fail(res, "Доступ запрещён", 403);
    }
    next();
  };
}
