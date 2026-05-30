import { z } from "zod";

const flowerBase = {
  name: z.string().min(1, "Название обязательно"),
  kind: z.enum(["garden", "indoor"]),
  season: z.enum(["spring", "summer", "autumn", "winter"]),
  country: z.string().min(1, "Страна обязательна"),
  price: z.coerce.number().positive("Цена должна быть больше 0"),
  growingType: z.enum(["greenhouse", "orangery", "open_ground"]),
  imageUrl: z.string().url("Некорректный URL изображения"),
  description: z.string().min(1, "Описание обязательно"),
  isPopular: z.boolean().optional(),
  varieties: z.array(z.string().min(1)).optional(),
  supplierIds: z.array(z.string().uuid()).optional(),
  sellerIds: z.array(z.string().uuid()).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
};

export const createFlowerSchema = z.object(flowerBase);
export const updateFlowerSchema = z.object(flowerBase).partial();

export const supplierSchema = z.object({
  name: z.string().min(1),
  businessType: z.string().min(1),
  address: z.string().min(1),
});

export const sellerSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(1, "ФИО обязательно"),
  phone: z
    .string()
    .min(10, "Телефон обязателен")
    .regex(/^[\d\s+\-()]+$/, "Некорректный формат телефона"),
  deliveryAddress: z.string().min(1, "Адрес обязателен"),
});
