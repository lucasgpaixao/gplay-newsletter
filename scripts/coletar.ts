/**
 * Coletor GPlay Newsletter
 * - Le os feeds RSS de src/config/fontes.ts
 * - Grava uma nota .md por noticia em src/content/noticias/<Categoria>/<AAAA-MM>/
 * - Grava videos em src/content/videos/<CategoriaRelacionada>/<AAAA-MM>/
 * - Deduplica por guid/link e mantem ate MAX_NOTICIAS_POR_CATEGORIA por categoria
 * - Retem ate MAX_VIDEOS_POR_CATEGORIA_RELACIONADA videos por tema
 *
 * Uso: npm run coletar  |  npm run coletar:limpar
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";

import { FONTES } from "../src/config/fontes.ts";
import { MAX_NOTICIAS_POR_CATEGORIA } from "../src/lib/noticias-limites.ts";
import { slugify, hashCurto } from "../src/lib/slug.ts";
import { ehNoticiaCupomOuCodigoPromo } from "../src/lib/filtro-noticias.ts";
import { extrairImagem, limparHtml, resumir } from "../src/lib/texto.ts";
import { MAX_VIDEOS_POR_CATEGORIA_RELACIONADA } from "../src/lib/videos-limites.ts";
import { coletarVideos } from "./coletar-videos.ts";
import { MAX_ITENS_POR_FEED, parseFeedUrl } from "./rss-utils.ts";

// ----- carregar .env (Node 22) -----
try {
  // @ts-ignore - disponivel no Node 22+
  process.loadEnvFile?.();
} catch {
  /* .env ausente, sem problema */
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, "..");
const DIR_NOTICIAS = join(RAIZ, "src", "content", "noticias");
const DIR_VIDEOS = join(RAIZ, "src", "content", "videos");
const LIMPAR = process.argv.includes("--limpar");

const parser = new Parser({
  timeout: 25000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml; q=0.9, */*; q=0.8",
  },
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
      ["content:encoded", "content:encoded"],
      ["dc:creator", "creator"],
    ],
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

function guidsExistentes(): Set<string> {
  const set = new Set<string>();
  for (const arq of listarArquivosMd(DIR_NOTICIAS)) {
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

interface MetaNoticia {
  arquivo: string;
  categoria: string;
  publicado: number;
}

function metaDeArquivo(arq: string): MetaNoticia | null {
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

  const mCat = conteudo.match(/^categoria:\s*(.+)$/m);
  let categoria: string;
  if (mCat) {
    try {
      categoria = JSON.parse(mCat[1].trim());
    } catch {
      categoria = mCat[1].trim();
    }
  } else {
    categoria = relative(DIR_NOTICIAS, arq).split(/[/\\]/)[0] ?? "";
  }
  if (!categoria) return null;

  return { arquivo: arq, categoria, publicado };
}

function limparPastasVazias(dir: string): void {
  if (!existsSync(dir)) return;
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (entrada.isDirectory()) limparPastasVazias(join(dir, entrada.name));
  }
  if (dir !== DIR_NOTICIAS && readdirSync(dir).length === 0) {
    rmSync(dir, { recursive: true });
  }
}

/** Mantem as MAX_NOTICIAS_POR_CATEGORIA mais recentes de cada categoria. */
function aplicarRetencao(): number {
  const porCategoria = new Map<string, MetaNoticia[]>();

  for (const arq of listarArquivosMd(DIR_NOTICIAS)) {
    const meta = metaDeArquivo(arq);
    if (!meta) continue;
    const lista = porCategoria.get(meta.categoria) ?? [];
    lista.push(meta);
    porCategoria.set(meta.categoria, lista);
  }

  let removidos = 0;
  for (const lista of porCategoria.values()) {
    lista.sort((a, b) => b.publicado - a.publicado);
    for (const meta of lista.slice(MAX_NOTICIAS_POR_CATEGORIA)) {
      rmSync(meta.arquivo);
      removidos++;
    }
  }

  limparPastasVazias(DIR_NOTICIAS);
  return removidos;
}

function contarMdPorPastaRaiz(dir: string): Map<string, number> {
  const contagem = new Map<string, number>();
  if (!existsSync(dir)) return contagem;
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (!entrada.isDirectory()) continue;
    const pasta = join(dir, entrada.name);
    contagem.set(entrada.name, listarArquivosMd(pasta).length);
  }
  return contagem;
}

function logResumoAcervo(): void {
  console.log("\n--- Acervo após retenção ---");
  const noticias = contarMdPorPastaRaiz(DIR_NOTICIAS);
  for (const cat of [...noticias.keys()].sort()) {
    const n = noticias.get(cat) ?? 0;
    const ok = n <= MAX_NOTICIAS_POR_CATEGORIA ? "ok" : "EXCEDEU";
    console.log(`  Notícias/${cat}: ${n}/${MAX_NOTICIAS_POR_CATEGORIA} (${ok})`);
  }
  const videos = contarMdPorPastaRaiz(DIR_VIDEOS);
  for (const cat of [...videos.keys()].sort()) {
    const n = videos.get(cat) ?? 0;
    const ok = n <= MAX_VIDEOS_POR_CATEGORIA_RELACIONADA ? "ok" : "EXCEDEU";
    console.log(`  Vídeos/${cat}: ${n}/${MAX_VIDEOS_POR_CATEGORIA_RELACIONADA} (${ok})`);
  }
}

function removerNoticiasCupomNoAcervo(): number {
  let removidos = 0;
  for (const arq of listarArquivosMd(DIR_NOTICIAS)) {
    const raw = readFileSync(arq, "utf8");
    const tituloRaw = raw.match(/^titulo:\s*(.+)$/m)?.[1];
    const linkRaw = raw.match(/^link:\s*(.+)$/m)?.[1];
    if (!tituloRaw) continue;
    let tituloLimpo = tituloRaw;
    let linkLimpo = linkRaw;
    try {
      tituloLimpo = JSON.parse(tituloRaw) as string;
      if (linkRaw) linkLimpo = JSON.parse(linkRaw) as string;
    } catch {
      tituloLimpo = tituloRaw.replace(/^"|"$/g, "");
      linkLimpo = linkRaw?.replace(/^"|"$/g, "");
    }
    if (!ehNoticiaCupomOuCodigoPromo({ titulo: tituloLimpo, link: linkLimpo })) continue;
    rmSync(arq, { force: true });
    removidos++;
  }
  return removidos;
}

async function main() {
  console.log(`\n=== GPlay Newsletter :: coleta ===`);
  console.log(`Retencao: ${MAX_NOTICIAS_POR_CATEGORIA} noticias por categoria`);
  console.log(`Retencao videos: ${MAX_VIDEOS_POR_CATEGORIA_RELACIONADA} por categoria relacionada`);

  if (LIMPAR) {
    if (existsSync(DIR_NOTICIAS)) {
      rmSync(DIR_NOTICIAS, { recursive: true, force: true });
      console.log("Acervo de noticias limpo (--limpar).");
    }
    if (existsSync(DIR_VIDEOS)) {
      rmSync(DIR_VIDEOS, { recursive: true, force: true });
      console.log("Acervo de videos limpo (--limpar).");
    }
  }
  mkdirSync(DIR_NOTICIAS, { recursive: true });

  const jaExistem = guidsExistentes();
  const vistosNestaRodada = new Set<string>();
  let novos = 0;

  for (const fonte of FONTES) {
    process.stdout.write(`\n[${fonte.categoria}] ${fonte.nome} ... `);
    let feed;
    let totalNoFeed = 0;
    try {
      ({ feed, totalNoFeed } = await parseFeedUrl(parser, fonte.url));
    } catch (err) {
      console.log(`FALHOU (${(err as Error).message})`);
      continue;
    }
    const itens = feed.items ?? [];
    const rotulo =
      totalNoFeed > MAX_ITENS_POR_FEED
        ? `${itens.length} do feed (${totalNoFeed} no feed, teto ${MAX_ITENS_POR_FEED})`
        : `${itens.length} do feed`;
    console.log(rotulo);

    for (const item of itens) {
      const link = (item.link || item.guid || "").trim();
      const guid = (item.guid || link).trim();
      if (!link || !guid) continue;
      if (jaExistem.has(guid) || vistosNestaRodada.has(guid)) continue;
      vistosNestaRodada.add(guid);

      const publicado = item.isoDate ? new Date(item.isoDate) : new Date();

      const titulo = limparHtml(item.title || "(sem titulo)");
      const resumo = resumir(item.contentSnippet || item.content || item.summary || "");

      if (ehNoticiaCupomOuCodigoPromo({ titulo, link })) continue;

      const imagem = extrairImagem(item);
      const autor = limparHtml((item as any).creator || item.author || "");
      const slug = `${aaaaMMDD(publicado)}-${slugify(titulo) || hashCurto(guid)}`;
      const dir = join(DIR_NOTICIAS, fonte.categoria, aaaaMM(publicado));
      mkdirSync(dir, { recursive: true });
      const arquivo = join(dir, `${slug}.md`);
      if (existsSync(arquivo)) continue;

      const linhas = [
        "---",
        `titulo: ${fm(titulo)}`,
        `resumo: ${fm(resumo)}`,
        `categoria: ${fm(fonte.categoria)}`,
        `fonte: ${fm(fonte.nome)}`,
        `link: ${fm(link)}`,
        imagem ? `imagem: ${fm(imagem)}` : null,
        autor ? `autor: ${fm(autor)}` : null,
        `publicado: ${fm(publicado.toISOString())}`,
        `coletado: ${fm(new Date().toISOString())}`,
        `guid: ${fm(guid)}`,
        "---",
        "",
        resumo || titulo,
        "",
      ]
        .filter((l) => l !== null)
        .join("\n");

      writeFileSync(arquivo, linhas, "utf8");
      novos++;
    }
  }

  const removidosCupom = removerNoticiasCupomNoAcervo();
  if (removidosCupom > 0) {
    console.log(`\nCupons/codigos promocionais removidos do acervo: ${removidosCupom}`);
  }

  const removidos = aplicarRetencao();

  console.log(`\n--- Videos YouTube ---`);
  const { novos: novosVideos, removidos: removidosVideos } = await coletarVideos(DIR_VIDEOS);

  logResumoAcervo();

  console.log(
    `\n=== Concluido: ${novos} noticias novas, ${removidos} noticias removidas; ` +
      `${novosVideos} videos novos, ${removidosVideos} videos removidos ===\n`,
  );
}

main().catch((err) => {
  console.error("Erro fatal na coleta:", err);
  process.exit(1);
});
