import { Router } from "express";
import prisma from "../utils/prisma.js";
import { ok, fail } from "../utils/response.js";
import { verifyToken, checkRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createFlowerSchema,
  updateFlowerSchema,
  supplierSchema,
  sellerSchema,
} from "../validators/flower.js";
import { flowerInclude, mapFlower } from "../utils/flowerInclude.js";

const router = Router();
router.use(verifyToken, checkRole("admin"));

async function syncRelations(flowerId, { varieties, supplierIds, sellerIds, categoryIds, tagIds }) {
  if (varieties !== undefined) {
    await prisma.variety.deleteMany({ where: { flowerId } });
    if (varieties.length) {
      await prisma.variety.createMany({
        data: varieties.map((name) => ({ flowerId, name })),
      });
    }
  }
  if (supplierIds !== undefined) {
    await prisma.flowerSupplier.deleteMany({ where: { flowerId } });
    if (supplierIds.length) {
      await prisma.flowerSupplier.createMany({
        data: supplierIds.map((supplierId) => ({ flowerId, supplierId })),
      });
    }
  }
  if (sellerIds !== undefined) {
    await prisma.flowerSeller.deleteMany({ where: { flowerId } });
    if (sellerIds.length) {
      await prisma.flowerSeller.createMany({
        data: sellerIds.map((sellerId) => ({ flowerId, sellerId })),
      });
    }
  }
  if (categoryIds !== undefined) {
    await prisma.flowerCategory.deleteMany({ where: { flowerId } });
    if (categoryIds.length) {
      await prisma.flowerCategory.createMany({
        data: categoryIds.map((categoryId) => ({ flowerId, categoryId })),
      });
    }
  }
  if (tagIds !== undefined) {
    await prisma.flowerTag.deleteMany({ where: { flowerId } });
    if (tagIds.length) {
      await prisma.flowerTag.createMany({
        data: tagIds.map((tagId) => ({ flowerId, tagId })),
      });
    }
  }
}

// --- Flowers ---
router.get("/flowers", async (_req, res) => {
  const flowers = await prisma.flower.findMany({
    include: flowerInclude,
    orderBy: { name: "asc" },
  });
  return ok(res, flowers.map(mapFlower));
});

router.get("/flowers/:id", async (req, res) => {
  const flower = await prisma.flower.findUnique({
    where: { id: req.params.id },
    include: flowerInclude,
  });
  if (!flower) return fail(res, "Не найдено", 404);
  return ok(res, mapFlower(flower));
});

router.post("/flowers", validate(createFlowerSchema), async (req, res) => {
  const { varieties, supplierIds, sellerIds, categoryIds, tagIds, ...data } = req.body;
  const flower = await prisma.flower.create({ data });
  await syncRelations(flower.id, { varieties, supplierIds, sellerIds, categoryIds, tagIds });
  const full = await prisma.flower.findUnique({
    where: { id: flower.id },
    include: flowerInclude,
  });
  return ok(res, mapFlower(full), 201);
});

router.put("/flowers/:id", validate(updateFlowerSchema), async (req, res) => {
  const { varieties, supplierIds, sellerIds, categoryIds, tagIds, ...data } = req.body;
  try {
    await prisma.flower.update({ where: { id: req.params.id }, data });
  } catch {
    return fail(res, "Не найдено", 404);
  }
  await syncRelations(req.params.id, { varieties, supplierIds, sellerIds, categoryIds, tagIds });
  const full = await prisma.flower.findUnique({
    where: { id: req.params.id },
    include: flowerInclude,
  });
  return ok(res, mapFlower(full));
});

router.delete("/flowers/:id", async (req, res) => {
  try {
    await prisma.flower.delete({ where: { id: req.params.id } });
  } catch {
    return fail(res, "Не найдено", 404);
  }
  return ok(res, { success: true });
});

// --- Suppliers ---
router.get("/suppliers", async (_req, res) => {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  return ok(res, suppliers);
});

router.post("/suppliers", validate(supplierSchema), async (req, res) => {
  const supplier = await prisma.supplier.create({ data: req.body });
  return ok(res, supplier, 201);
});

router.put("/suppliers/:id", validate(supplierSchema), async (req, res) => {
  try {
    const supplier = await prisma.supplier.update({ where: { id: req.params.id }, data: req.body });
    return ok(res, supplier);
  } catch {
    return fail(res, "Не найдено", 404);
  }
});

router.delete("/suppliers/:id", async (req, res) => {
  try {
    await prisma.supplier.delete({ where: { id: req.params.id } });
  } catch {
    return fail(res, "Не найдено", 404);
  }
  return ok(res, { success: true });
});

// --- Sellers ---
router.get("/sellers", async (_req, res) => {
  const sellers = await prisma.seller.findMany({ orderBy: { name: "asc" } });
  return ok(res, sellers);
});

router.post("/sellers", validate(sellerSchema), async (req, res) => {
  const seller = await prisma.seller.create({ data: req.body });
  return ok(res, seller, 201);
});

router.put("/sellers/:id", validate(sellerSchema), async (req, res) => {
  try {
    const seller = await prisma.seller.update({ where: { id: req.params.id }, data: req.body });
    return ok(res, seller);
  } catch {
    return fail(res, "Не найдено", 404);
  }
});

router.delete("/sellers/:id", async (req, res) => {
  try {
    await prisma.seller.delete({ where: { id: req.params.id } });
  } catch {
    return fail(res, "Не найдено", 404);
  }
  return ok(res, { success: true });
});

// --- Lists ---
router.get("/lists/flowers", async (_req, res) => {
  const flowers = await prisma.flower.findMany({
    include: flowerInclude,
    orderBy: { name: "asc" },
  });
  const rows = flowers.map((f) => {
    const m = mapFlower(f);
    return {
      id: m.id,
      name: m.name,
      kind: m.kind,
      season: m.season,
      country: m.country,
      price: m.price,
      growingType: m.growingType,
      varieties: m.varieties.map((v) => v.name).join(", "),
      suppliers: m.suppliers.map((s) => s.name).join(", "),
      sellers: m.sellers.map((s) => s.name).join(", "),
    };
  });
  return ok(res, rows);
});

router.get("/lists/suppliers", async (_req, res) => {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  return ok(res, suppliers);
});

router.get("/lists/sellers", async (_req, res) => {
  const sellers = await prisma.seller.findMany({ orderBy: { name: "asc" } });
  return ok(res, sellers);
});

// --- Supplier flowers ---
router.get("/supplier-flowers/:supplierId", async (req, res) => {
  const links = await prisma.flowerSupplier.findMany({
    where: { supplierId: req.params.supplierId },
    include: { flower: { include: flowerInclude } },
  });
  return ok(res, links.map((l) => mapFlower(l.flower)));
});

router.post("/supplier-flowers", async (req, res) => {
  const { supplierId, flowerId } = req.body;
  if (!supplierId || !flowerId) return fail(res, "supplierId и flowerId обязательны");
  await prisma.flowerSupplier.upsert({
    where: { flowerId_supplierId: { flowerId, supplierId } },
    create: { flowerId, supplierId },
    update: {},
  });
  return ok(res, { success: true }, 201);
});

router.delete("/supplier-flowers", async (req, res) => {
  const { supplierId, flowerId } = req.body;
  await prisma.flowerSupplier.deleteMany({ where: { supplierId, flowerId } });
  return ok(res, { success: true });
});

// --- Orders ---
router.get("/orders", async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { flower: true, seller: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return ok(res, orders);
});

router.patch("/orders/:id/status", async (req, res) => {
  const status = req.body.status;
  const valid = ["pending", "shipped", "delivered", "cancelled"];
  if (!valid.includes(status)) return fail(res, "Некорректный статус");
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { user: { select: { id: true, name: true, email: true } }, items: true },
    });
    return ok(res, order);
  } catch {
    return fail(res, "Не найдено", 404);
  }
});

// --- Reports ---
router.get("/reports/suppliers", async (_req, res) => {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  return ok(res, suppliers);
});

router.get("/reports/flowers-by-supplier", async (req, res) => {
  const supplierId = req.query.supplierId;
  if (!supplierId) return fail(res, "Выберите поставщика");
  const flowers = await prisma.flower.findMany({
    where: { suppliers: { some: { supplierId } } },
    select: { name: true, price: true, season: true },
    orderBy: { name: "asc" },
  });
  return ok(res, flowers);
});

router.get("/reports/seasons", async (_req, res) => {
  const seasons = await prisma.flower.findMany({
    select: { season: true },
    distinct: ["season"],
  });
  return ok(res, seasons.map((s) => s.season));
});

router.get("/reports/flowers-by-season", async (req, res) => {
  const season = req.query.season;
  if (!season) return fail(res, "Выберите сезон");
  const flowers = await prisma.flower.findMany({
    where: { season },
    select: { name: true, country: true, price: true },
    orderBy: { name: "asc" },
  });
  return ok(res, flowers);
});

router.get("/reports/countries", async (_req, res) => {
  const countries = await prisma.flower.findMany({
    select: { country: true },
    distinct: ["country"],
    orderBy: { country: "asc" },
  });
  return ok(res, countries.map((c) => c.country));
});

router.get("/reports/flowers-by-country", async (req, res) => {
  const country = req.query.country;
  if (!country) return fail(res, "Укажите страну");
  const flowers = await prisma.flower.findMany({
    where: { country: { contains: country, mode: "insensitive" } },
    select: { name: true, season: true, price: true },
    orderBy: { name: "asc" },
  });
  return ok(res, flowers);
});

router.get("/reports/sellers-by-variety", async (req, res) => {
  const variety = req.query.variety;
  if (!variety) return fail(res, "Укажите название сорта");
  const varieties = await prisma.variety.findMany({
    where: { name: { contains: variety, mode: "insensitive" } },
    include: {
      flower: {
        include: {
          sellers: { include: { seller: true } },
        },
      },
    },
  });
  const rows = [];
  for (const v of varieties) {
    for (const fs of v.flower.sellers) {
      rows.push({
        sellerName: fs.seller.name,
        address: fs.seller.address,
        flowerName: v.flower.name,
        price: v.flower.price,
      });
    }
  }
  return ok(res, rows);
});

router.get("/reports/sellers-of-most-expensive", async (_req, res) => {
  const maxFlower = await prisma.flower.findFirst({
    orderBy: { price: "desc" },
    select: { price: true },
  });
  if (!maxFlower) return res.json({ data: [], maxPrice: 0 });
  const flowers = await prisma.flower.findMany({
    where: { price: maxFlower.price },
    include: { sellers: { include: { seller: true } } },
  });
  const rows = [];
  for (const f of flowers) {
    for (const fs of f.sellers) {
      rows.push({
        sellerName: fs.seller.name,
        address: fs.seller.address,
        flowerName: f.name,
        price: f.price,
      });
    }
  }
  return res.json({ data: rows, maxPrice: maxFlower.price });
});

router.get("/reports/common-suppliers", async (req, res) => {
  const { sellerA, sellerB } = req.query;
  if (!sellerA || !sellerB) return fail(res, "Выберите двух продавцов");

  const flowersA = await prisma.flowerSeller.findMany({
    where: { sellerId: sellerA },
    select: { flowerId: true },
  });
  const flowersB = await prisma.flowerSeller.findMany({
    where: { sellerId: sellerB },
    select: { flowerId: true },
  });
  const idsA = new Set(flowersA.map((f) => f.flowerId));
  const commonFlowerIds = flowersB.filter((f) => idsA.has(f.flowerId)).map((f) => f.flowerId);

  const supplierLinks = await prisma.flowerSupplier.findMany({
    where: { flowerId: { in: commonFlowerIds } },
    include: { supplier: true },
    distinct: ["supplierId"],
  });

  const suppliers = supplierLinks.map((l) => l.supplier);
  return ok(res, suppliers);
});

router.get("/categories", async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return ok(res, categories);
});

router.get("/tags", async (_req, res) => {
  const tags = await prisma.tag.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] });
  return ok(res, tags);
});

router.get("/stats", async (_req, res) => {
  const [flowers, suppliers, sellers, orders, varieties, clients, pendingOrders] =
    await Promise.all([
      prisma.flower.count(),
      prisma.supplier.count(),
      prisma.seller.count(),
      prisma.order.count(),
      prisma.variety.count(),
      prisma.user.count({ where: { role: "client" } }),
      prisma.order.count({ where: { status: "pending" } }),
    ]);
  return ok(res, { flowers, suppliers, sellers, orders, varieties, clients, pendingOrders });
});

export default router;
