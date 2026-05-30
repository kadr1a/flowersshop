import { Router } from "express";
import prisma from "../utils/prisma.js";
import { ok, fail } from "../utils/response.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();
router.use(verifyToken);

const cartInclude = {
  flower: { include: { varieties: true } },
  seller: true,
};

router.get("/", async (req, res) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: cartInclude,
  });
  return ok(res, items);
});

router.post("/", async (req, res) => {
  const { flowerId, sellerId, quantity = 1 } = req.body;
  if (!flowerId || !sellerId) return fail(res, "flowerId и sellerId обязательны");

  const link = await prisma.flowerSeller.findUnique({
    where: { flowerId_sellerId: { flowerId, sellerId } },
  });
  if (!link) return fail(res, "Продавец не продаёт этот цветок", 400);

  const item = await prisma.cartItem.upsert({
    where: { userId_flowerId_sellerId: { userId: req.user.id, flowerId, sellerId } },
    create: { userId: req.user.id, flowerId, sellerId, quantity },
    update: { quantity: { increment: quantity } },
    include: cartInclude,
  });
  return ok(res, item, 201);
});

router.put("/:id", async (req, res) => {
  const qty = parseInt(req.body.quantity);
  if (!qty || qty < 1) return fail(res, "Количество должно быть >= 1");

  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!item) return fail(res, "Не найдено", 404);

  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: qty },
    include: cartInclude,
  });
  return ok(res, updated);
});

router.delete("/:id", async (req, res) => {
  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!item) return fail(res, "Не найдено", 404);
  await prisma.cartItem.delete({ where: { id: item.id } });
  return ok(res, { success: true });
});

router.delete("/", async (req, res) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
  return ok(res, { success: true });
});

export default router;
