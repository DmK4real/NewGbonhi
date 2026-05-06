export type StudioDesign = {
  id: string;
  title: string;
  category: "logo" | "sticker";
  imagePrimary: string;
  tags: string[];
};

type StudioDesignSource = Omit<StudioDesign, "imagePrimary"> & {
  fileName: string;
};

const designSources: StudioDesignSource[] = [
  {
    id: "newgbonhi-classic",
    title: "New Gbonhi Classic",
    category: "logo",
    fileName: "newgbonhi-logo.png",
    tags: ["classic", "clean"],
  },
  {
    id: "cameleon-signature",
    title: "Cameleon Signature",
    category: "logo",
    fileName: "CAMELEON LOGO.jpeg",
    tags: ["signature", "drop02"],
  },
  {
    id: "red-cameleon",
    title: "Red Cameleon",
    category: "sticker",
    fileName: "RED CAMELEON.jpeg",
    tags: ["sticker", "bold"],
  },
  {
    id: "newgbonhi-art",
    title: "New Gbonhi Art",
    category: "sticker",
    fileName: "NEW GBONHI ART.jpeg",
    tags: ["art", "graphic"],
  },
  {
    id: "arw-film",
    title: "ARW Film",
    category: "sticker",
    fileName: "ARW FILM.png",
    tags: ["arw", "film", "logo"],
  },
  {
    id: "newgbonhi-oval",
    title: "New Gbonhi Oval",
    category: "sticker",
    fileName: "NEW GBONHI OVAL.png",
    tags: ["newgbonhi", "oval", "logo"],
  },
];

export const studioDesigns: StudioDesign[] = designSources.map((source) => ({
  id: source.id,
  title: source.title,
  category: source.category,
  tags: source.tags,
  imagePrimary: new URL(`../assets/${source.fileName}`, import.meta.url).href,
}));
