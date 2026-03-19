import productsData from "./products.json";

const imageKeyToFile = {
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
);

const webpModules = import.meta.glob("../assets/webp/*.webp", {
  eager: true,
  import: "default",
});
const webpMap = Object.fromEntries(
  Object.entries(webpModules).map(([path, url]) => [path.split("/").pop(), url])
);

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");

const resolveImageByKey = (imageKey) => {
  if (!imageKey) {
    return "";
  }
  return imageKeyMap[imageKey] || "";
};

const resolveWebpByKey = (imageKey) => {
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

const resolveImagePrimary = (product) => {
  if (Array.isArray(product.variants) && product.variants.length) {
    return resolveImageByKey(product.variants[0].imageKey);
  }
  if (product.imageKey && imageKeyMap[product.imageKey]) {
    return imageKeyMap[product.imageKey];
  }
  return product.imagePrimary || "";
};

const resolveImageWebp = (product) => {
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

export const products = productsData.map((product, index) => {
  const slug = product.slug || slugify(product.title || `product-${index + 1}`);
  const variants = Array.isArray(product.variants)
    ? product.variants.map((variant) => ({
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

export const findProductBySlug = (slug) =>
  products.find((product) => product.slug === slug);
