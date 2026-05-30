import { Router } from "express";
import prisma from "../utils/prisma.js";
import { ok } from "../utils/response.js";
import { flowerInclude, mapFlower } from "../utils/flowerInclude.js";

const router = Router();

const SORT_MAP = {
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  popular: { isPopular: "desc" },
};

router.get("/categories", async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return ok(res, categories);
});

router.get("/tags", async (_req, res) => {
  const tags = await prisma.tag.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] });
  return ok(res, tags);
});

router.get("/sellers", async (_req, res) => {
  const sellers = await prisma.seller.findMany({ orderBy: { name: "asc" } });
  return ok(res, sellers);
});

router.get("/flowers", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const where = {};

  if (req.query.isPopular === "true") {
    where.isPopular = true;
  }

  const category = req.query.category;
  if (category && category !== "all" && category !== "popular") {
    where.categories = { some: { category: { slug: category } } };
  }

  if (req.query.search) {
    where.name = { contains: req.query.search, mode: "insensitive" };
  }

  if (req.query.minPrice) {
    where.price = { ...where.price, gte: parseFloat(req.query.minPrice) };
  }
  if (req.query.maxPrice) {
    where.price = { ...where.price, lte: parseFloat(req.query.maxPrice) };
  }

  if (req.query.kind) {
    where.kind = req.query.kind;
  }

  const colors = [].concat(req.query.color || []).filter(Boolean);
  const events = [].concat(req.query.event || []).filter(Boolean);
  const quantities = [].concat(req.query.quantity || []).filter(Boolean);

  const tagFilters = [];
  if (colors.length) tagFilters.push({ tag: { type: "color", name: { in: colors } } });
  if (events.length) tagFilters.push({ tag: { type: "event", name: { in: events } } });
  if (quantities.length) tagFilters.push({ tag: { type: "quantity", name: { in: quantities } } });

  if (tagFilters.length === 1) {
    where.tags = { some: tagFilters[0] };
  } else if (tagFilters.length > 1) {
    where.AND = tagFilters.map((tf) => ({ tags: { some: tf } }));
  }

  if (req.query.variety) {
    where.varieties = { some: { name: { contains: req.query.variety, mode: "insensitive" } } };
  }

  const sortKey = req.query.sort || "popular";
  const orderBy = SORT_MAP[sortKey] || { createdAt: "desc" };

  const [flowers, total] = await Promise.all([
    prisma.flower.findMany({
      where,
      include: flowerInclude,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.flower.count({ where }),
  ]);

  return res.json({
    data: flowers.map(mapFlower),
    count: total,
    page,
    limit,
  });
});

router.get("/flowers/:id", async (req, res) => {
  const flower = await prisma.flower.findUnique({
    where: { id: req.params.id },
    include: flowerInclude,
  });
  if (!flower) return res.status(404).json({ error: "Цветок не найден" });
  return ok(res, mapFlower(flower));
});

export default router;
