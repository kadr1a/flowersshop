import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль минимум 6 символов"),
  name: z.string().min(1, "Имя обязательно"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  password: z.string().min(6).optional(),
});
