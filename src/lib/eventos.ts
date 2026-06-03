import { getCollection, type CollectionEntry } from "astro:content";
import {
  escolherEventoEmFoco,
  eventoAoVivoDados,
  eventoEncerradoDados,
  fimDoEventoDados,
  type EventoDados,
} from "./eventos-core";

export const TEASER_EVENTO_DIAS = 7;
export const COLETA_RAPIDA_MINUTOS = 20;
export const INTERVALO_COLETA_PADRAO_LABEL = "~1 hora";
export const INTERVALO_COLETA_RAPIDA_LABEL = `~${COLETA_RAPIDA_MINUTOS} minutos`;

/** @deprecated Use INTERVALO_COLETA_PADRAO_LABEL */
export const INTERVALO_COLETA_AO_VIVO_LABEL = INTERVALO_COLETA_PADRAO_LABEL;

export type EventoEntry = CollectionEntry<"eventos">;

function dadosDe(entry: EventoEntry): EventoDados {
  return {
    slug: entry.slug,
    inicio: entry.data.inicio,
    fim: entry.data.fim,
  };
}

export function fimDoEvento(e: EventoEntry["data"]): Date {
  return fimDoEventoDados(e);
}

export function eventoEncerrado(e: EventoEntry["data"], agora = Date.now()): boolean {
  return eventoEncerradoDados(e, agora);
}

export function eventoAoVivo(e: EventoEntry["data"], agora = Date.now()): boolean {
  return eventoAoVivoDados(e, agora);
}

/** Texto de intervalo de atualização na página do evento em ao vivo. */
export async function intervaloAtualizacaoAoVivo(
  entry: EventoEntry,
  agora = Date.now(),
): Promise<string> {
  if (!eventoAoVivo(entry.data, agora)) return INTERVALO_COLETA_PADRAO_LABEL;
  const foco = await eventoEmFoco();
  if (foco?.slug === entry.slug) return INTERVALO_COLETA_RAPIDA_LABEL;
  return INTERVALO_COLETA_PADRAO_LABEL;
}

function casaKeywords(texto: string, keywords: string[]): boolean {
  if (!keywords.length) return false;
  const t = texto.toLowerCase();
  return keywords.some((k) => t.includes(k));
}

/** Após encerrar, só entram itens coletados até o fim (cobertura deixa de crescer). */
export function itemEntraNaCoberturaDoEvento(
  evento: EventoEntry["data"],
  texto: string,
  coletado: Date,
  agora = Date.now(),
): boolean {
  const kws = evento.keywords.map((k) => k.toLowerCase());
  if (!casaKeywords(texto, kws)) return false;
  if (eventoEncerrado(evento, agora) && coletado.getTime() > fimDoEvento(evento).getTime()) {
    return false;
  }
  return true;
}

export function noticiasDoEvento(
  evento: EventoEntry,
  noticias: CollectionEntry<"noticias">[],
  agora = Date.now(),
): CollectionEntry<"noticias">[] {
  return noticias.filter((n) => {
    const texto = `${n.data.titulo} ${n.data.resumo}`;
    return itemEntraNaCoberturaDoEvento(evento.data, texto, n.data.coletado, agora);
  });
}

export function videosDoEvento(
  evento: EventoEntry,
  videos: CollectionEntry<"videos">[],
  agora = Date.now(),
): CollectionEntry<"videos">[] {
  return videos.filter((v) => itemEntraNaCoberturaDoEvento(evento.data, v.data.titulo, v.data.coletado, agora));
}

export function ultimaColetaCobertura(
  noticias: CollectionEntry<"noticias">[],
  videos: CollectionEntry<"videos">[],
): Date | null {
  let max = 0;
  for (const n of noticias) max = Math.max(max, n.data.coletado.getTime());
  for (const v of videos) max = Math.max(max, v.data.coletado.getTime());
  return max ? new Date(max) : null;
}

/** Próximo evento não encerrado (menor início entre os candidatos). */
export async function eventoEmFoco(): Promise<EventoEntry | null> {
  const agora = Date.now();
  const todos = await getCollection("eventos");
  const escolhido = escolherEventoEmFoco(
    todos.map(dadosDe),
    agora,
  );
  if (!escolhido) return null;
  return todos.find((e) => e.slug === escolhido.slug) ?? null;
}

export async function eventoTeaserCapa(): Promise<EventoEntry | null> {
  if (await eventoEmFoco()) return null;
  const agora = Date.now();
  const limite = agora + TEASER_EVENTO_DIAS * 24 * 60 * 60 * 1000;
  const todos = await getCollection("eventos");
  const proximos = todos.filter((e) => {
    const ini = e.data.inicio.getTime();
    return ini > agora && ini <= limite && !eventoEncerrado(e.data, agora);
  });
  if (!proximos.length) return null;
  proximos.sort((a, b) => a.data.inicio.getTime() - b.data.inicio.getTime());
  return proximos[0];
}

export function hrefEvento(slug: string): string {
  return `/evento/${slug}`;
}
