import productsData from "./products.json";

type ProductVariant = {
  imageKey?: string;
  imagePrimary?: string;
  imageWebp?: string;
  [key: string]: unknown;
};

export type ProductRecord = {
  id?: string;
  slug: string;
  title?: string;
  url: string;
  imageKey?: string;
  imagePrimary: string;
  imageSecondary: string;
  imageWebp: string;
  category?: string;
  tags?: string[];
  soldOut?: boolean;
  variants: ProductVariant[] | null;
  [key: string]: unknown;
};

type RawProduct = {
  id?: string;
  slug?: string;
  title?: string;
  url?: string;
  imageKey?: string;
  imagePrimary?: string;
  imageSecondary?: string;
  imageWebp?: string;
  variants?: ProductVariant[];
  [key: string]: unknown;
};

const imageKeyToFile: Record<string, string> = {
  safeZoneBlack: "BLACK SAFE zone 4 BOY.png",
  whiteCameleon: "WHITE CAMELEON.png",
  safeBabiGirlBlack: "BLACK SAFE BABI GIRL.png",
  newGbonhiOnTop: "NEW GBONHI ON TOP CAMELEON.png",
  newGbonhiOnTopBgab: "NEW GBONHI ON TOP BGAB.png",
  safeZoneWhite: "WHITE SAFE zone 4 BOY.png",
  safeBabiGirl: "WHITE SAFE BABI GIRL.png",
  blackCameleon: "BLACK CAMELEON.png",
};

const imageKeyMap = Object.fromEntries(
  Object.entries(imageKeyToFile).map(([key, fileName]) => [
    key,
    new URL(`../assets/${fileName}`, import.meta.url).href,
  ])
) as Record<string, string>;

const webpModules = import.meta.glob("../assets/webp/*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const webpMap = Object.fromEntries(
  Object.entries(webpModules).map(([path, url]) => [path.split("/").pop(), url])
) as Record<string, string>;

const slugify = (value: string | undefined) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");

const resolveImageByKey = (imageKey?: string): string => {
  if (!imageKey) {
    return "";
  }
  return imageKeyMap[imageKey] || "";
};

const resolveWebpByKey = (imageKey?: string): string => {
  if (!imageKey) {
    return "";
  }
  const fileName = imageKeyToFile[imageKey];
  if (!fileName) {
    return "";
  }
  const webpName = fileName.replace(/\.(png|jpe?g)$/i, ".webp");
  return webpMap[webpName] || "";
};

const resolveImagePrimary = (product: RawProduct): string => {
  if (Array.isArray(product.variants) && product.variants.length) {
    return resolveImageByKey(product.variants[0].imageKey);
  }
  if (product.imageKey && imageKeyMap[product.imageKey]) {
    return imageKeyMap[product.imageKey];
  }
  return product.imagePrimary || "";
};

const resolveImageWebp = (product: RawProduct): string => {
  if (Array.isArray(product.variants) && product.variants.length) {
    return resolveWebpByKey(product.variants[0].imageKey);
  }
  if (product.imageWebp) {
    return product.imageWebp;
  }
  if (!product.imageKey) {
    return "";
  }
  const fileName = imageKeyToFile[product.imageKey];
  if (!fileName) {
    return "";
  }
  const webpName = fileName.replace(/\.(png|jpe?g)$/i, ".webp");
  return webpMap[webpName] || "";
};

const rawProducts: RawProduct[] = Array.isArray(productsData)
  ? (productsData as RawProduct[])
  : [];

export const products: ProductRecord[] = rawProducts.map((product, index) => {
  const slug = product.slug || slugify(product.title || `product-${index + 1}`);
  const variants = Array.isArray(product.variants)
    ? product.variants.map((variant: ProductVariant) => ({
        ...variant,
        imagePrimary: resolveImageByKey(variant.imageKey),
        imageWebp: resolveWebpByKey(variant.imageKey),
      }))
    : null;
  const primaryFromVariants = variants?.[0]?.imagePrimary || "";
  const secondaryFromVariants = variants?.[1]?.imagePrimary || "";
  return {
    ...product,
    slug,
    url: product.url || `/product/${slug}`,
    variants,
    imagePrimary: primaryFromVariants || resolveImagePrimary(product),
    imageSecondary: secondaryFromVariants || product.imageSecondary || "",
    imageWebp: resolveImageWebp(product),
  };
});

export const findProductBySlug = (
  slug: string | undefined
): ProductRecord | undefined =>
  products.find((product) => product.slug === slug);
