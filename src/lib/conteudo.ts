import { getCollection, type CollectionEntry } from "astro:content";

export async function noticiasOrdenadas(): Promise<CollectionEntry<"noticias">[]> {
  const todas = await getCollection("noticias");
  return todas.sort((a, b) => b.data.publicado.getTime() - a.data.publicado.getTime());
}

export async function noticiasPorCategoria(cat: string): Promise<CollectionEntry<"noticias">[]> {
  const todas = await noticiasOrdenadas();
  return todas.filter((n) => n.data.categoria === cat);
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
