/* ---------- illustrations peintes : la liste est remplie par build.mjs depuis assets/ ---------- */
/* chaque image assets/<nom>.webp devient la classe CSS .p-<nom> ; sans image, on garde le dessin vectoriel */
const PAINT = new Set(/*@PAINT@*/[]);
const paint = (...names) => names.find(n => PAINT.has(n));
