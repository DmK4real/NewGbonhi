// Prepare the silhouette for GPU filtering. Only the matte fringe changes;
// opaque fabric and printed artwork keep their original RGB pixels.
export function prepareGarmentPixels(source, width, height) {
  const count = width * height;
  const pixels = new Uint8ClampedArray(source);
  const distance = new Float32Array(count);
  const inset = Math.max(1, Math.min(3, Math.max(width, height) / 400));
  const diagonal = Math.SQRT2;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = y * width + x;
    distance[i] = source[i * 4 + 3] < 128 ? 0 : Math.min(x + 1, y + 1, width - x, height - y, 10000);
    if (x) distance[i] = Math.min(distance[i], distance[i - 1] + 1);
    if (y) distance[i] = Math.min(distance[i], distance[i - width] + 1);
    if (x && y) distance[i] = Math.min(distance[i], distance[i - width - 1] + diagonal);
    if (x < width - 1 && y) distance[i] = Math.min(distance[i], distance[i - width + 1] + diagonal);
  }
  for (let y = height - 1; y >= 0; y--) for (let x = width - 1; x >= 0; x--) {
    const i = y * width + x;
    if (x < width - 1) distance[i] = Math.min(distance[i], distance[i + 1] + 1);
    if (y < height - 1) distance[i] = Math.min(distance[i], distance[i + width] + 1);
    if (x && y < height - 1) distance[i] = Math.min(distance[i], distance[i + width - 1] + diagonal);
    if (x < width - 1 && y < height - 1) distance[i] = Math.min(distance[i], distance[i + width + 1] + diagonal);
    pixels[i * 4 + 3] = source[i * 4 + 3] * Math.max(0, Math.min(1, distance[i] - inset - .25));
  }

  // Extend nearby fabric colors underneath transparent texels, so mipmaps
  // cannot mix the old white background into the visible fabric edge.
  const queue = new Int32Array(count);
  const visited = new Uint8Array(count);
  let head = 0, tail = 0;
  for (let i = 0; i < count; i++) if (distance[i] > inset + 1.25 && distance[i] <= inset + 2.5 && pixels[i * 4 + 3] > 240) {
    queue[tail++] = i; visited[i] = 1;
  }
  while (head < tail) {
    const i = queue[head++];
    if (visited[i] > 5) continue;
    const x = i % width, y = Math.floor(i / width);
    const neighbors = [];
    if (x) neighbors.push(i - 1);
    if (x < width - 1) neighbors.push(i + 1);
    if (y) neighbors.push(i - width);
    if (y < height - 1) neighbors.push(i + width);
    for (const neighbor of neighbors) {
      if (visited[neighbor] || pixels[neighbor * 4 + 3] === 255) continue;
      visited[neighbor] = visited[i] + 1;
      for (let channel = 0; channel < 3; channel++) pixels[neighbor * 4 + channel] = pixels[i * 4 + channel];
      queue[tail++] = neighbor;
    }
  }
  return pixels;
}
