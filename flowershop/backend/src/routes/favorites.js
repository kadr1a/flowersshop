import { Router } from "express";
import prisma from "../utils/prisma.js";
import { ok, fail } from "../utils/response.js";
import { verifyToken } from "../middleware/auth.js";
import { flowerInclude, mapFlower } from "../utils/flowerInclude.js";

const router = Router();

router.get("/", verifyToken, async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id },
    include: { flower: { include: flowerInclude } },
  });
  return ok(
    res,
    favorites.map((f) => ({ id: f.id, flowerId: f.flowerId, flower: mapFlower(f.flower) }))
  );
});

router.post("/sync", verifyToken, async (req, res) => {
  const ids = Array.isArray(req.body.flowerIds) ? req.body.flowerIds : [];
  for (const flowerId of ids) {
    await prisma.favorite.upsert({
      where: { userId_flowerId: { userId: req.user.id, flowerId } },
      create: { userId: req.user.id, flowerId },
      update: {},
    });
  }
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id },
    include: { flower: { include: flowerInclude } },
  });
  return ok(
    res,
    favorites.map((f) => ({ id: f.id, flowerId: f.flowerId, flower: mapFlower(f.flower) }))
  );
});

router.post("/:flowerId", verifyToken, async (req, res) => {
  const flower = await prisma.flower.findUnique({ where: { id: req.params.flowerId } });
  if (!flower) return fail(res, "Цветок не найден", 404);

  const fav = await prisma.favorite.upsert({
    where: { userId_flowerId: { userId: req.user.id, flowerId: flower.id } },
    create: { userId: req.user.id, flowerId: flower.id },
    update: {},
    include: { flower: { include: flowerInclude } },
  });
  return ok(res, { id: fav.id, flowerId: fav.flowerId, flower: mapFlower(fav.flower) }, 201);
});

router.delete("/:flowerId", verifyToken, async (req, res) => {
  await prisma.favorite.deleteMany({
    where: { userId: req.user.id, flowerId: req.params.flowerId },
  });
  return ok(res, { success: true });
});

export default router;
