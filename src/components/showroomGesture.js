// Convert screen movement to world distance, independent of viewport size.
export function panScale(width, aspect, fov, distance) {
  const visibleWidth = 2 * distance * Math.tan(fov * Math.PI / 360) * aspect;
  return visibleWidth / Math.max(1, width) * 1.2;
}

export function coastPan(pan, velocity, elapsed, limit) {
  const decay = Math.exp(-Math.min(elapsed, 64) / 220);
  const next = pan + velocity * 220 * (1 - decay);
  const clamped = Math.max(-limit, Math.min(limit, next));
  return { pan: clamped, velocity: clamped !== next || Math.abs(velocity * decay) < .0003 ? 0 : velocity * decay };
}
