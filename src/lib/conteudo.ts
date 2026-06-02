import { getCollection, type CollectionEntry } from "astro:content";
import { MAX_NOTICIAS_POR_CATEGORIA } from "./noticias-limites";
import {
  MAX_VIDEOS_CAPA,
  MAX_VIDEOS_PAGINA_TEMATICA,
  MAX_VIDEOS_POR_CATEGORIA_RELACIONADA,
} from "./videos-limites";

export { MAX_NOTICIAS_POR_CATEGORIA };
export {
  MAX_VIDEOS_CAPA,
  MAX_VIDEOS_PAGINA_TEMATICA,
  MAX_VIDEOS_POR_CATEGORIA_RELACIONADA,
};

export async function noticiasOrdenadas(): Promise<CollectionEntry<"noticias">[]> {
  const todas = await getCollection("noticias");
  return todas.sort((a, b) => b.data.publicado.getTime() - a.data.publicado.getTime());
}

/** Notícias publicadas no site: até MAX por categoria, das mais recentes. */
export async function noticiasPublicadas(): Promise<CollectionEntry<"noticias">[]> {
  const todas = await noticiasOrdenadas();
  const contagem = new Map<string, number>();
  const publicadas: CollectionEntry<"noticias">[] = [];

  for (const n of todas) {
    const cat = n.data.categoria;
    const q = contagem.get(cat) ?? 0;
    if (q >= MAX_NOTICIAS_POR_CATEGORIA) continue;
    contagem.set(cat, q + 1);
    publicadas.push(n);
  }

  return publicadas;
}

export async function noticiasPorCategoria(cat: string): Promise<CollectionEntry<"noticias">[]> {
  const publicadas = await noticiasPublicadas();
  return publicadas.filter((n) => n.data.categoria === cat);
}

export async function eventosOrdenados(): Promise<CollectionEntry<"eventos">[]> {
  const todos = await getCollection("eventos");
  return todos.sort((a, b) => a.data.inicio.getTime() - b.data.inicio.getTime());
}

export async function proximosEventos(): Promise<CollectionEntry<"eventos">[]> {
  const agora = Date.now();
  const todos = await eventosOrdenados();
  const ativos = todos.filter((e) => {
    const fim = e.data.fim ?? new Date(e.data.inicio.getTime() + 2 * 60 * 60 * 1000);
    return fim.getTime() >= agora;
  });
  return ativos.length ? ativos : todos;
}

export async function videosOrdenados(): Promise<CollectionEntry<"videos">[]> {
  const todos = await getCollection("videos");
  return todos.sort((a, b) => b.data.publicado.getTime() - a.data.publicado.getTime());
}

/** Vídeos no site: até MAX por categoria relacionada, dos mais recentes. */
export async function videosPublicados(): Promise<CollectionEntry<"videos">[]> {
  const todos = await videosOrdenados();
  const contagem = new Map<string, number>();
  const publicados: CollectionEntry<"videos">[] = [];

  for (const v of todos) {
    const cat = v.data.categoriaRelacionada;
    const q = contagem.get(cat) ?? 0;
    if (q >= MAX_VIDEOS_POR_CATEGORIA_RELACIONADA) continue;
    contagem.set(cat, q + 1);
    publicados.push(v);
  }

  return publicados;
}

export async function videosPorCategoriaRelacionada(
  cat: string,
): Promise<CollectionEntry<"videos">[]> {
  const publicados = await videosPublicados();
  return publicados.filter((v) => v.data.categoriaRelacionada === cat);
}

/** Destaque na capa: os N vídeos mais recentes (todas as categorias). */
export async function videosDestaqueCapa(): Promise<CollectionEntry<"videos">[]> {
  const publicados = await videosPublicados();
  return publicados.slice(0, MAX_VIDEOS_CAPA);
}

export async function videosBlocoTematico(
  cat: string,
): Promise<CollectionEntry<"videos">[]> {
  const doTema = await videosPorCategoriaRelacionada(cat);
  return doTema.slice(0, MAX_VIDEOS_PAGINA_TEMATICA);
}

export function noticiasDoEvento(
  evento: CollectionEntry<"eventos">,
  noticias: CollectionEntry<"noticias">[],
): CollectionEntry<"noticias">[] {
  const kws = evento.data.keywords.map((k) => k.toLowerCase());
  if (!kws.length) return [];
  return noticias.filter((n) => {
    const texto = `${n.data.titulo} ${n.data.titulo_original ?? ""} ${n.data.resumo}`.toLowerCase();
    return kws.some((k) => texto.includes(k));
  });
}
