export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

export function hashCurto(texto: string): string {
  let h = 0;
  for (let i = 0; i < texto.length; i++) {
    h = (Math.imul(31, h) + texto.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}
