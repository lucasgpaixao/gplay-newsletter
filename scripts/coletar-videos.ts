import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import Parser from "rss-parser";

import { CANAIS_YOUTUBE, urlFeedCanal } from "../src/config/canais-youtube.ts";
import { MAX_VIDEOS_POR_CATEGORIA_RELACIONADA } from "../src/lib/videos-limites.ts";
import { slugify, hashCurto } from "../src/lib/slug.ts";
import { limparHtml } from "../src/lib/texto.ts";
import { thumbnailYoutube } from "../src/lib/youtube.ts";
import { limiarPublicadoRetido } from "./acervo-limiar.ts";
import { parseFeedUrl } from "./rss-utils.ts";

const parser = new Parser({
  timeout: 25000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "application/atom+xml, application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8",
  },
  customFields: {
    item: [["yt:videoId", "ytVideoId"]],
  },
});

function fm(valor: string): string {
  return JSON.stringify(valor ?? "");
}

function aaaaMM(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function aaaaMMDD(d: Date): string {
  return `${aaaaMM(d)}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function listarArquivosMd(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entrada.name);
    if (entrada.isDirectory()) out.push(...listarArquivosMd(p));
    else if (entrada.name.endsWith(".md")) out.push(p);
  }
  return out;
}

function extrairVideoId(item: Parser.Item): string | null {
  const yt = (item as Parser.Item & { ytVideoId?: string }).ytVideoId?.trim();
  if (yt) return yt;
  const id = (item.id || "").trim();
  const m = id.match(/^yt:video:(.+)$/);
  if (m) return m[1];
  const link = (item.link || "").trim();
  const ml = link.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  return ml ? ml[1] : null;
}

interface MetaVideo {
  arquivo: string;
  categoriaRelacionada: string;
  publicado: number;
}

function metaDeArquivo(arq: string, dirVideos: string): MetaVideo | null {
  const conteudo = readFileSync(arq, "utf8");
  const mPub = conteudo.match(/^publicado:\s*(.+)$/m);
  if (!mPub) return null;

  let rawPub = mPub[1].trim();
  try {
    rawPub = JSON.parse(rawPub);
  } catch {
    /* manter string */
  }
  const publicado = new Date(rawPub).getTime();
  if (Number.isNaN(publicado)) return null;

  const mCat = conteudo.match(/^categoriaRelacionada:\s*(.+)$/m);
  let categoriaRelacionada: string;
  if (mCat) {
    try {
      categoriaRelacionada = JSON.parse(mCat[1].trim());
    } catch {
      categoriaRelacionada = mCat[1].trim();
    }
  } else {
    categoriaRelacionada = relative(dirVideos, arq).split(/[/\\]/)[0] ?? "";
  }
  if (!categoriaRelacionada) return null;

  return { arquivo: arq, categoriaRelacionada, publicado };
}

function limparPastasVazias(dir: string, raiz: string): void {
  if (!existsSync(dir)) return;
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (entrada.isDirectory()) limparPastasVazias(join(dir, entrada.name), raiz);
  }
  if (dir !== raiz && readdirSync(dir).length === 0) {
    rmSync(dir, { recursive: true });
  }
}

function aplicarRetencao(dirVideos: string): number {
  const porCategoria = new Map<string, MetaVideo[]>();

  for (const arq of listarArquivosMd(dirVideos)) {
    const meta = metaDeArquivo(arq, dirVideos);
    if (!meta) continue;
    const lista = porCategoria.get(meta.categoriaRelacionada) ?? [];
    lista.push(meta);
    porCategoria.set(meta.categoriaRelacionada, lista);
  }

  let removidos = 0;
  for (const lista of porCategoria.values()) {
    lista.sort((a, b) => b.publicado - a.publicado);
    for (const meta of lista.slice(MAX_VIDEOS_POR_CATEGORIA_RELACIONADA)) {
      rmSync(meta.arquivo);
      removidos++;
    }
  }

  limparPastasVazias(dirVideos, dirVideos);
  return removidos;
}

function guidsExistentes(dirVideos: string): Set<string> {
  const set = new Set<string>();
  for (const arq of listarArquivosMd(dirVideos)) {
    const m = readFileSync(arq, "utf8").match(/^guid:\s*(.+)$/m);
    if (m) {
      try {
        set.add(JSON.parse(m[1]));
      } catch {
        set.add(m[1].trim());
      }
    }
  }
  return set;
}

export interface ResultadoColetaVideos {
  novos: number;
  removidos: number;
}

export async function coletarVideos(dirVideos: string): Promise<ResultadoColetaVideos> {
  mkdirSync(dirVideos, { recursive: true });

  const jaExistem = guidsExistentes(dirVideos);
  const limiarPorCategoria = limiarPublicadoRetido(
    dirVideos,
    MAX_VIDEOS_POR_CATEGORIA_RELACIONADA,
    (arq) => {
      const meta = metaDeArquivo(arq, dirVideos);
      return meta ? { chave: meta.categoriaRelacionada, publicado: meta.publicado } : null;
    },
  );
  const vistosNestaRodada = new Set<string>();
  let novos = 0;

  for (const canal of CANAIS_YOUTUBE) {
    const url = urlFeedCanal(canal.channelId);
    process.stdout.write(`\n[YouTube/${canal.categoriaRelacionada}] ${canal.nome} ... `);
    let feed;
    let totalNoFeed = 0;
    try {
      ({ feed, totalNoFeed } = await parseFeedUrl(
        parser,
        url,
        MAX_VIDEOS_POR_CATEGORIA_RELACIONADA,
      ));
    } catch (err) {
      console.log(`FALHOU (${(err as Error).message})`);
      continue;
    }
    const itens = feed.items ?? [];
    const rotulo =
      totalNoFeed > MAX_VIDEOS_POR_CATEGORIA_RELACIONADA
        ? `${itens.length} do feed (${totalNoFeed} no feed, teto ${MAX_VIDEOS_POR_CATEGORIA_RELACIONADA})`
        : `${itens.length} do feed`;
    console.log(rotulo);

    for (const item of itens) {
      const videoId = extrairVideoId(item);
      if (!videoId) continue;

      const guid = `yt:video:${videoId}`;
      if (jaExistem.has(guid) || vistosNestaRodada.has(guid)) continue;
      vistosNestaRodada.add(guid);

      const publicado = item.isoDate ? new Date(item.isoDate) : new Date();
      const limiar = limiarPorCategoria.get(canal.categoriaRelacionada);
      if (limiar !== undefined && publicado.getTime() < limiar) continue;

      const titulo = limparHtml(item.title || "(sem titulo)");
      const link = (item.link || `https://www.youtube.com/watch?v=${videoId}`).trim();
      const thumbnail = thumbnailYoutube(videoId);
      const slug = `${aaaaMMDD(publicado)}-${slugify(titulo) || hashCurto(videoId)}`;
      const dir = join(dirVideos, canal.categoriaRelacionada, aaaaMM(publicado));
      mkdirSync(dir, { recursive: true });
      const arquivo = join(dir, `${slug}.md`);
      if (existsSync(arquivo)) continue;

      const linhas = [
        "---",
        `titulo: ${fm(titulo)}`,
        `categoriaRelacionada: ${fm(canal.categoriaRelacionada)}`,
        `canal: ${fm(canal.nome)}`,
        `videoId: ${fm(videoId)}`,
        `link: ${fm(link)}`,
        `thumbnail: ${fm(thumbnail)}`,
        `publicado: ${fm(publicado.toISOString())}`,
        `coletado: ${fm(new Date().toISOString())}`,
        `guid: ${fm(guid)}`,
        "---",
        "",
        titulo,
        "",
      ].join("\n");

      writeFileSync(arquivo, linhas, "utf8");
      novos++;
    }
  }

  const removidos = aplicarRetencao(dirVideos);
  return { novos, removidos };
}
