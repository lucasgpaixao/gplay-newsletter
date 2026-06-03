function extrairTextoBruto(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map(extrairTextoBruto).filter(Boolean).join(" ");
  }
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    for (const key of ["_", "#", "name", "text", "value", "content"]) {
      const v = o[key];
      if (typeof v === "string" && v) return v;
    }
    if (typeof o.name === "string") return o.name;
  }
  return "";
}

export function limparHtml(html: string | undefined | unknown): string {
  const texto = extrairTextoBruto(html);
  if (!texto) return "";
  return texto
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8230;/g, "...")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resumir(texto: string, max = 320): string {
  const limpo = limparHtml(texto);
  if (limpo.length <= max) return limpo;
  const corte = limpo.slice(0, max);
  const ultimo = corte.lastIndexOf(" ");
  return (ultimo > 0 ? corte.slice(0, ultimo) : corte).trim() + "...";
}

const RE_IMG = /<img[^>]+src=["']([^"']+)["']/i;

export function extrairImagem(item: Record<string, any>): string | undefined {
  const enc = item.enclosure?.url;
  if (enc && /^https?:\/\//.test(enc) && /(jpg|jpeg|png|webp|gif|avif)/i.test(enc)) return enc;

  const media = item["media:content"]?.$?.url || item["media:thumbnail"]?.$?.url;
  if (media && /^https?:\/\//.test(media)) return media;

  const html = extrairTextoBruto(item["content:encoded"] || item.content || item.summary || "");
  const m = html.match(RE_IMG);
  if (m && /^https?:\/\//.test(m[1])) return m[1];

  return undefined;
}
