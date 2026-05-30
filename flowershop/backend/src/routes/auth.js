import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../utils/prisma.js";
import { ok, fail } from "../utils/response.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema, updateProfileSchema } from "../validators/auth.js";
import { signToken, verifyToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", validate(registerSchema), async (req, res) => {
  const { email, password, name, phone } = req.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return fail(res, "Email уже зарегистрирован", 409);

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hash, name, phone, role: "client" },
    select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
  });

  const token = signToken(user);
  return ok(res, { user, token }, 201);
});

router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return fail(res, "Неверный email или пароль", 401);
  }

  const safe = {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
  return ok(res, { user: safe, token: signToken(safe) });
});

router.get("/me", verifyToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
  });
  if (!user) return fail(res, "Пользователь не найден", 404);
  return ok(res, user);
});

router.put("/profile", verifyToken, validate(updateProfileSchema), async (req, res) => {
  const data = {};
  if (req.body.name) data.name = req.body.name;
  if (req.body.phone !== undefined) data.phone = req.body.phone;
  if (req.body.password) data.password = await bcrypt.hash(req.body.password, 10);

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
  });
  return ok(res, user);
});

export default router;
