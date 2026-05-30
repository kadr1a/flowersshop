import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const FLOWER_IMAGES = [
  "https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&w=400",
  "https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg?auto=compress&w=400",
  "https://images.pexels.com/photos/931176/pexels-photo-931176.jpeg?auto=compress&w=400",
  "https://images.pexels.com/photos/931178/pexels-photo-931178.jpeg?auto=compress&w=400",
  "https://images.pexels.com/photos/931179/pexels-photo-931179.jpeg?auto=compress&w=400",
  "https://images.pexels.com/photos/931180/pexels-photo-931180.jpeg?auto=compress&w=400",
  "https://images.pexels.com/photos/931181/pexels-photo-931181.jpeg?auto=compress&w=400",
  "https://images.pexels.com/photos/931182/pexels-photo-931182.jpeg?auto=compress&w=400",
  "https://images.pexels.com/photos/931183/pexels-photo-931183.jpeg?auto=compress&w=400",
  "https://images.pexels.com/photos/931184/pexels-photo-931184.jpeg?auto=compress&w=400",
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.flowerTag.deleteMany();
  await prisma.flowerCategory.deleteMany();
  await prisma.flowerSupplier.deleteMany();
  await prisma.flowerSeller.deleteMany();
  await prisma.variety.deleteMany();
  await prisma.flower.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash("admin123", 10);
  const clientHash = await bcrypt.hash("client123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@flowers.com",
      password: adminHash,
      name: "Администратор",
      phone: "+79001234567",
      role: "admin",
    },
  });

  const client = await prisma.user.create({
    data: {
      email: "client@example.com",
      password: clientHash,
      name: "Иван Клиентов",
      phone: "+79007654321",
      role: "client",
    },
  });

  const categories = await Promise.all(
    [
      { name: "Популярные", slug: "popular" },
      { name: "Монобукеты", slug: "monobukety" },
      { name: "Свадебные", slug: "svadebnye" },
      { name: "В корзинках", slug: "v-korzinkakh" },
      { name: "В коробках", slug: "v-korobkakh" },
      { name: "В пачках", slug: "v-pachkakh" },
      { name: "Розы", slug: "rozy" },
      { name: "Тюльпаны", slug: "tyulpany" },
      { name: "Хризантемы", slug: "khrizantemy" },
      { name: "Пионы", slug: "piony" },
    ].map((c) => prisma.category.create({ data: c }))
  );

  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const colorTags = await Promise.all(
    ["красный", "розовый", "белый", "жёлтый"].map((name) =>
      prisma.tag.create({ data: { name, type: "color" } })
    )
  );
  const eventTags = await Promise.all(
    ["день рождения", "свадьба", "8 марта", "извинение"].map((name) =>
      prisma.tag.create({ data: { name, type: "event" } })
    )
  );
  const qtyTags = await Promise.all(
    ["3", "5", "7", "11", "21", "51"].map((name) =>
      prisma.tag.create({ data: { name, type: "quantity" } })
    )
  );
  const allTags = [...colorTags, ...eventTags, ...qtyTags];

  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: "Петров Иван Сергеевич",
        businessType: "тепличное хозяйство",
        address: "Московская обл., д. Розово, ул. Садовая, 12",
      },
    }),
    prisma.supplier.create({
      data: {
        name: "Сидорова Мария Петровна",
        businessType: "питомник",
        address: "Ленинградская обл., г. Пушкин, Набережная, 5",
      },
    }),
    prisma.supplier.create({
      data: {
        name: "Козлов Алексей Викторович",
        businessType: "фермерское хозяйство",
        address: "Краснодарский край, ст. Цветочная, 88",
      },
    }),
  ]);

  const sellers = await Promise.all([
    prisma.seller.create({
      data: { name: "ООО «Цветочный рай»", address: "г. Москва, ул. Цветочная, 1" },
    }),
    prisma.seller.create({
      data: { name: "ИП Смирнова А.В.", address: "г. Санкт-Петербург, Невский пр., 100" },
    }),
    prisma.seller.create({
      data: { name: "Магазин «Лепесток»", address: "г. Казань, ул. Баумана, 25" },
    }),
  ]);

  const flowersData = [
    {
      name: "Розы красные",
      kind: "garden",
      season: "summer",
      country: "Эквадор",
      price: 3500,
      growingType: "greenhouse",
      description: "Классические красные розы премиум-класса.",
      isPopular: true,
      varieties: ["Чайно-гибридная", "Пионовидная", "Флорибунда"],
      cats: ["popular", "rozy", "monobukety"],
      tags: ["красный", "свадьба", "11"],
    },
    {
      name: "Тюльпаны жёлтые",
      kind: "garden",
      season: "spring",
      country: "Нидерланды",
      price: 1200,
      growingType: "open_ground",
      description: "Яркие весенние тюльпаны.",
      isPopular: true,
      varieties: ["Триумф", "Попугай"],
      cats: ["popular", "tyulpany", "v-pachkakh"],
      tags: ["жёлтый", "8 марта", "7"],
    },
    {
      name: "Хризантемы белые",
      kind: "garden",
      season: "autumn",
      country: "Россия",
      price: 1800,
      growingType: "orangery",
      description: "Пышные белые хризантемы.",
      isPopular: true,
      varieties: ["Кустовая", "Крупноцветковая"],
      cats: ["popular", "khrizantemy"],
      tags: ["белый", "день рождения", "5"],
    },
    {
      name: "Лилии розовые",
      kind: "garden",
      season: "summer",
      country: "Китай",
      price: 2200,
      growingType: "greenhouse",
      description: "Ароматные розовые лилии.",
      isPopular: false,
      varieties: ["Азиатская", "Восточная"],
      cats: ["monobukety"],
      tags: ["розовый", "свадьба", "3"],
    },
    {
      name: "Пионы коралловые",
      kind: "garden",
      season: "summer",
      country: "Франция",
      price: 4500,
      growingType: "open_ground",
      description: "Нежные пионы для особых случаев.",
      isPopular: true,
      varieties: ["Травянистый", "Древовидный"],
      cats: ["popular", "piony", "svadebnye"],
      tags: ["розовый", "свадьба", "5"],
    },
    {
      name: "Орхидеи фаленопсис",
      kind: "indoor",
      season: "winter",
      country: "Таиланд",
      price: 3200,
      growingType: "greenhouse",
      description: "Элегантные комнатные орхидеи.",
      isPopular: false,
      varieties: ["Фаленопсис", "Дендробиум"],
      cats: ["v-korobkakh"],
      tags: ["белый", "извинение", "3"],
    },
    {
      name: "Гортензии голубые",
      kind: "garden",
      season: "summer",
      country: "Япония",
      price: 2800,
      growingType: "orangery",
      description: "Пышные голубые гортензии.",
      isPopular: true,
      varieties: ["Крупнолистная", "Древовидная"],
      cats: ["v-korzinkakh", "svadebnye"],
      tags: ["белый", "свадьба", "7"],
    },
    {
      name: "Герберы микс",
      kind: "garden",
      season: "spring",
      country: "Кения",
      price: 1500,
      growingType: "greenhouse",
      description: "Яркий микс гербер.",
      isPopular: false,
      varieties: ["Стандарт", "Мини"],
      cats: ["v-pachkakh"],
      tags: ["красный", "день рождения", "11"],
    },
    {
      name: "Ирисы фиолетовые",
      kind: "garden",
      season: "spring",
      country: "Германия",
      price: 1900,
      growingType: "open_ground",
      description: "Изящные ирисы.",
      isPopular: false,
      varieties: ["Бородатый", "Сибирский"],
      cats: ["monobukety"],
      tags: ["розовый", "8 марта", "5"],
    },
    {
      name: "Подсолнухи",
      kind: "garden",
      season: "autumn",
      country: "Россия",
      price: 900,
      growingType: "open_ground",
      description: "Солнечные подсолнухи.",
      isPopular: true,
      varieties: ["Высокорослый", "Карликовый"],
      cats: ["popular", "v-korzinkakh"],
      tags: ["жёлтый", "день рождения", "3"],
    },
  ];

  for (let i = 0; i < flowersData.length; i++) {
    const fd = flowersData[i];
    const flower = await prisma.flower.create({
      data: {
        name: fd.name,
        kind: fd.kind,
        season: fd.season,
        country: fd.country,
        price: fd.price,
        growingType: fd.growingType,
        imageUrl: FLOWER_IMAGES[i % FLOWER_IMAGES.length],
        description: fd.description,
        isPopular: fd.isPopular,
        varieties: { create: fd.varieties.map((name) => ({ name })) },
        suppliers: {
          create: [
            { supplierId: suppliers[i % 3].id },
            { supplierId: suppliers[(i + 1) % 3].id },
          ],
        },
        sellers: {
          create: sellers.map((s) => ({ sellerId: s.id })),
        },
        categories: {
          create: fd.cats.map((slug) => ({ categoryId: catBySlug[slug].id })),
        },
        tags: {
          create: fd.tags.map((tagName) => {
            const tag = allTags.find((t) => t.name === tagName);
            return { tagId: tag.id };
          }),
        },
      },
    });
    void flower;
  }

  console.log("Seed completed:");
  console.log("  Admin:", admin.email, "/ admin123");
  console.log("  Client:", client.email, "/ client123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
