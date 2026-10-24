# Showroom cotton assets

Generated with the built-in image_gen tool. These are blank fabric mockups; artwork is sampled separately from the original product textures by applyOriginalPrint in garmentPrint.js. Original product files are unchanged. The renderer transfers original ink onto the new cotton and matches fabric lighting.


Catalog extension (all product colors, fronts and backs)

The catalog exports are generated reproducibly with `scripts/bake-catalog.mjs` while Vite and a CDP browser on port 9333 are running. `src/data/catalogMockups.json` specifies each original source, crop and print region. The shared `src/components/garmentPrint.js` applies original ink to the blank bases; the exported 22 views are in `src/assets/catalog/` at 960, 800 and 400 px widths. Safe products show their main back graphic first and their front as the second view. Crop tops retain their cropped mock-neck construction. Prices and availability are unchanged.

Additional blank assets and full prompts:

Safe Boy and Safe Babi Girl use `printSizing` in the catalog manifest. The
renderer fits their original artwork with its source width/height ratio, at
88% height on the back and 90% on the front. This leaves fabric around the
print and prevents the narrow archive designs stretching across the wider
oversized cotton bases. The garment itself keeps its size and silhouette.

### cotton-back-black.webp

Product mockup asset for an existing clothing catalog. Photorealistic professional apparel photograph, isolated on a genuinely transparent background. Full garment, centered straight-on view, suspended on a concealed hanger, no visible hanger or hook. Match the supplied cotton mockup's matte fabric quality, natural broad draping folds, realistic fine knit fibers, soft neutral studio light, subtle stitching and hems, clean edges without white halos. Absolutely BLANK: no logos, artwork, letters, prints, labels or background. No props, no floor, no external cast shadow. Narrow transparent margins. Preserve real wearable garment construction. Reference is the existing BLACK oversized cotton T-shirt FRONT used in this shop. Generate its matching BACK view: same black color, same cut, sleeve width, length, lighting and material. Show the rear neckline (high back neck, no front scoop, no visible inside-collar label). Entire back is blank.

### cotton-back-white.webp

Product mockup asset for an existing clothing catalog. Photorealistic professional apparel photograph, isolated on a genuinely transparent background. Full garment, centered straight-on view, suspended on a concealed hanger, no visible hanger or hook. Match the supplied cotton mockup's matte fabric quality, natural broad draping folds, realistic fine knit fibers, soft neutral studio light, subtle stitching and hems, clean edges without white halos. Absolutely BLANK: no logos, artwork, letters, prints, labels or background. No props, no floor, no external cast shadow. Narrow transparent margins. Preserve real wearable garment construction. Reference is the existing WHITE oversized cotton T-shirt FRONT used in this shop. Generate its matching BACK view: same neutral white color, same cut, sleeve width, length, lighting and material. Show the rear neckline (high back neck, no front scoop, no visible inside-collar label). Entire back is blank. White, not cream.

### cotton-crop-front.webp

Product mockup asset for an existing clothing catalog. Photorealistic professional apparel photograph, isolated on a genuinely transparent background. Full garment, centered straight-on view, suspended on a concealed hanger, no visible hanger or hook. Match the supplied cotton mockup's matte fabric quality, natural broad draping folds, realistic fine knit fibers, soft neutral studio light, subtle stitching and hems, clean edges without white halos. Absolutely BLANK: no logos, artwork, letters, prints, labels or background. No props, no floor, no external cast shadow. Narrow transparent margins. Preserve real wearable garment construction. Image 1 is garment construction reference: two BLACK cropped mock-neck short-sleeve tops, FRONT on the LEFT and BACK on the RIGHT, with graphics/background that must not be copied. Image 2 is material/photography style reference. Generate ONLY the FRONT view of a blank black cropped mock-neck short-sleeve top matching the cut in image 1: short cropped torso, raised mock neck, fitted compact short sleeves, subtle real rib knit. Retain this cropped mock-neck cut, do not turn it into a full-length crewneck T-shirt. No giant red oval, no graphic, no wordmark.

### cotton-crop-back.webp

Product mockup asset for an existing clothing catalog. Photorealistic professional apparel photograph, isolated on a genuinely transparent background. Full garment, centered straight-on view, suspended on a concealed hanger, no visible hanger or hook. Match the supplied cotton mockup's matte fabric quality, natural broad draping folds, realistic fine knit fibers, soft neutral studio light, subtle stitching and hems, clean edges without white halos. Absolutely BLANK: no logos, artwork, letters, prints, labels or background. No props, no floor, no external cast shadow. Narrow transparent margins. Preserve real wearable garment construction. Image 1 is garment construction reference: two BLACK cropped mock-neck short-sleeve tops, FRONT on the LEFT and BACK on the RIGHT, with graphics/background that must not be copied. Image 2 is material/photography style reference. Generate ONLY the BACK view of a blank black cropped mock-neck short-sleeve top matching the cut in image 1: short cropped torso, raised mock neck, fitted compact short sleeves, subtle real rib knit. Retain this cropped mock-neck cut, do not turn it into a full-length crewneck T-shirt. No giant red oval, no graphic, no wordmark.


Final assets:
- src/assets/showroom/cotton-black.webp
- src/assets/showroom/cotton-white.webp
- src/assets/showroom/cotton-washed.webp

Full prompts:

Black

Use case: product-mockup / precise-object-edit. Output a professional photorealistic FRONT product photograph of a BLANK oversized short-sleeve cotton T-shirt hanging under gravity from a concealed internal hanger. Full shirt, centered, straight-on, opaque real fabric on a genuinely transparent background. No visible hanger, no hook, no person, no props, no external cast shadow. Cotton must feel tangible: clear fine knitted fibers, ribbed neckline, shoulder seams, natural broad irregular draping folds, sagging supported sleeves, authentic sleeve openings and stitched hems. Restrained soft neutral studio light, not harsh highlights. Clean organic edges without any white halo, no plastic sheen, no synthetic grain. CRITICAL: remove ALL artwork, logos, letters, prints, wordmarks from the shirt; the website will apply original designs as separate unchanged decals. Keep the same overall oversized cut and fit, full garment with narrow transparent margins. Do not invent any new marks or labels. Edit target is the supplied photorealistic black cotton shirt. Preserve this exact rich matte black cotton, lighting, believable drape, cut, seams, perspective and fabric quality. Remove only the chameleon print and both wordmarks, extending natural unprinted black cotton over that region.

White

Use case: product-mockup / precise-object-edit. Output a professional photorealistic FRONT product photograph of a BLANK oversized short-sleeve cotton T-shirt hanging under gravity from a concealed internal hanger. Full shirt, centered, straight-on, opaque real fabric on a genuinely transparent background. No visible hanger, no hook, no person, no props, no external cast shadow. Cotton must feel tangible: clear fine knitted fibers, ribbed neckline, shoulder seams, natural broad irregular draping folds, sagging supported sleeves, authentic sleeve openings and stitched hems. Restrained soft neutral studio light, not harsh highlights. Clean organic edges without any white halo, no plastic sheen, no synthetic grain. CRITICAL: remove ALL artwork, logos, letters, prints, wordmarks from the shirt; the website will apply original designs as separate unchanged decals. Keep the same overall oversized cut and fit, full garment with narrow transparent margins. Do not invent any new marks or labels. Edit target is the supplied white T-shirt. Upgrade its fabric to a convincing photographic heavy soft WHITE cotton jersey suspended on an internal hanger, with natural asymmetrical broad folds. Keep the white color; remove the entire chameleon print and all wordmarks so this is a completely blank shirt. No yellow or beige tint, no dirty speckles.

Washed

Use case: product-mockup / precise-object-edit. Output a professional photorealistic FRONT product photograph of a BLANK oversized short-sleeve cotton T-shirt hanging under gravity from a concealed internal hanger. Full shirt, centered, straight-on, opaque real fabric on a genuinely transparent background. No visible hanger, no hook, no person, no props, no external cast shadow. Cotton must feel tangible: clear fine knitted fibers, ribbed neckline, shoulder seams, natural broad irregular draping folds, sagging supported sleeves, authentic sleeve openings and stitched hems. Restrained soft neutral studio light, not harsh highlights. Clean organic edges without any white halo, no plastic sheen, no synthetic grain. CRITICAL: remove ALL artwork, logos, letters, prints, wordmarks from the shirt; the website will apply original designs as separate unchanged decals. Keep the same overall oversized cut and fit, full garment with narrow transparent margins. Do not invent any new marks or labels. Edit target is the supplied washed black T-shirt. Upgrade it to a real photograph of thick soft washed-black cotton with an authentic subdued charcoal garment-dyed finish and natural draping folds. Preserve the washed-black product style, but no white edge marks, no scratches, no aggressively noisy or marbled gray patches. Remove the silver ARW graphic completely and leave blank cotton. Preserve natural collar ribbing and garment stitching.
