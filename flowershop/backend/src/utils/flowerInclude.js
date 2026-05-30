export const flowerInclude = {
  varieties: true,
  suppliers: { include: { supplier: true } },
  sellers: { include: { seller: true } },
  categories: { include: { category: true } },
  tags: { include: { tag: true } },
};

export function mapFlower(f) {
  if (!f) return null;
  return {
    ...f,
    suppliers: f.suppliers?.map((fs) => fs.supplier) || [],
    sellers: f.sellers?.map((fs) => fs.seller) || [],
    categories: f.categories?.map((fc) => fc.category) || [],
    tags: f.tags?.map((ft) => ft.tag) || [],
  };
}
