import { CORES_CATEGORIA, type Categoria } from "../config/fontes";
import { COR_YOUTUBE, NAV_YOUTUBE } from "../config/canais-youtube";

export const TZ = "America/Sao_Paulo";
export const NOME_SITE = "GPlay Newsletter";
export { COR_YOUTUBE, NAV_YOUTUBE };

export function corCategoria(cat: string): string {
  return CORES_CATEGORIA[cat as Categoria] ?? "#b3261e";
}

export function corCategoriaRelacionada(cat: string): string {
  return corCategoria(cat);
}

export function slugCategoria(cat: string): string {
  return cat
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function dataLonga(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(d);
}

export function dataCurta(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: TZ,
  }).format(d);
}

export function horaCurta(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(d);
}

export function tempoRelativo(d: Date): string {
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `ha ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `ha ${Math.floor(diff / 3600)} h`;
  const dias = Math.floor(diff / 86400);
  if (dias === 1) return "ontem";
  if (dias < 7) return `ha ${dias} dias`;
  return dataCurta(d);
}

export function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
