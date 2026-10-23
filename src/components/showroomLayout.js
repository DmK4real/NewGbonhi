// Spacing follows the actual silhouette width, including sleeves.
export function arrangeGarments(items, gap = .65) {
  const totalWidth = items.reduce((sum, item) => sum + item.width, 0) + Math.max(0, items.length - 1) * gap;
  let cursor = -totalWidth / 2;
  return items.map(item => {
    const placement = { ...item, x: cursor + item.width / 2 };
    cursor += item.width + gap;
    return placement;
  });
}

// Find where the real shoulder starts in the source cutout.
export function findShoulder(mask, u, height) {
  const x = Math.min(mask.width - 1, Math.max(0, Math.round(u * (mask.width - 1))));
  for (let y = 0; y < mask.height; y++) {
    if (mask.data[(y * mask.width + x) * 4 + 3] > 100) return (.5 - y / mask.height) * height;
  }
  return height * .36;
}
