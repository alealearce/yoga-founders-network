const TYPE_PREFIXES: Record<string, string> = {
  studio:   "/yogastudio",
  teacher:  "/yogateacher",
  school:   "/yogaschool",
  retreat:  "/retreatcenter",
  product:  "/yogaproducts",
  workshop: "/yogaworkshops",
};

export function getListingUrl(type: string, slug: string): string {
  return `${TYPE_PREFIXES[type] ?? "/listing"}/${slug}`;
}
