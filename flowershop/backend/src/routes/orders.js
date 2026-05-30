import { Router } from "express";
import prisma from "../utils/prisma.js";
import { ok, fail } from "../utils/response.js";
import { verifyToken } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { checkoutSchema } from "../validators/flower.js";

const router = Router();

const orderInclude = {
  items: {
    include: {
      flower: true,
      seller: true,
    },
  },
  user: { select: { id: true, name: true, email: true } },
};

router.post("/checkout", verifyToken, validate(checkoutSchema), async (req, res) => {
  const { customerName, phone, deliveryAddress } = req.body;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { flower: true, seller: true },
  });

  if (!cartItems.length) return fail(res, "Корзина пуста", 400);

  const total = cartItems.reduce((sum, item) => sum + item.flower.price * item.quantity, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: req.user.id,
        total,
        status: "pending",
        customerName,
        phone,
        deliveryAddress,
        items: {
          create: cartItems.map((item) => ({
            flowerId: item.flowerId,
            sellerId: item.sellerId,
            quantity: item.quantity,
            priceAtTime: item.flower.price,
          })),
        },
      },
      include: orderInclude,
    });
    await tx.cartItem.deleteMany({ where: { userId: req.user.id } });
    return created;
  });

  return ok(res, order, 201);
});

router.get("/my", verifyToken, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return ok(res, orders);
});

router.get("/my/:id", verifyToken, async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: orderInclude,
  });
  if (!order) return fail(res, "Заказ не найден", 404);
  return ok(res, order);
});

export default router;
