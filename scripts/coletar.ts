/**
 * Coletor GPlay Newsletter
 * - Le os feeds RSS de src/config/fontes.ts
 * - Grava uma nota .md por noticia em src/content/noticias/<Categoria>/<AAAA-MM>/
 * - Deduplica por guid/link e aplica retencao (RETENCAO_DIAS)
 *
 * Uso: npm run coletar  |  npm run coletar:limpar
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";

import { FONTES } from "../src/config/fontes.ts";
import { slugify, hashCurto } from "../src/lib/slug.ts";
import { extrairImagem, limparHtml, resumir } from "../src/lib/texto.ts";

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
const RETENCAO_DIAS = Number(process.env.RETENCAO_DIAS ?? 30);
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

function aplicarRetencao(): number {
  const limite = Date.now() - RETENCAO_DIAS * 24 * 60 * 60 * 1000;
  let removidos = 0;
  for (const arq of listarArquivosMd(DIR_NOTICIAS)) {
    const m = readFileSync(arq, "utf8").match(/^publicado:\s*(.+)$/m);
    if (!m) continue;
    let raw = m[1].trim();
    try {
      raw = JSON.parse(raw);
    } catch {
      /* manter */
    }
    const dt = new Date(raw).getTime();
    if (!Number.isNaN(dt) && dt < limite) {
      rmSync(arq);
      removidos++;
    }
  }
  return removidos;
}

async function main() {
  console.log(`\n=== GPlay Newsletter :: coleta ===`);
  console.log(`Retencao: ${RETENCAO_DIAS} dias`);

  if (LIMPAR && existsSync(DIR_NOTICIAS)) {
    rmSync(DIR_NOTICIAS, { recursive: true, force: true });
    console.log("Acervo de noticias limpo (--limpar).");
  }
  mkdirSync(DIR_NOTICIAS, { recursive: true });

  const jaExistem = guidsExistentes();
  const limiteRetencao = Date.now() - RETENCAO_DIAS * 24 * 60 * 60 * 1000;
  const vistosNestaRodada = new Set<string>();
  let novos = 0;

  for (const fonte of FONTES) {
    process.stdout.write(`\n[${fonte.categoria}] ${fonte.nome} ... `);
    let feed;
    try {
      feed = await parser.parseURL(fonte.url);
    } catch (err) {
      console.log(`FALHOU (${(err as Error).message})`);
      continue;
    }
    const itens = feed.items ?? [];
    console.log(`${itens.length} itens`);

    for (const item of itens) {
      const link = (item.link || item.guid || "").trim();
      const guid = (item.guid || link).trim();
      if (!link || !guid) continue;
      if (jaExistem.has(guid) || vistosNestaRodada.has(guid)) continue;
      vistosNestaRodada.add(guid);

      const publicado = item.isoDate ? new Date(item.isoDate) : new Date();
      if (publicado.getTime() < limiteRetencao) continue;

      const titulo = limparHtml(item.title || "(sem titulo)");
      const resumo = resumir(item.contentSnippet || item.content || item.summary || "");

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

  const removidos = aplicarRetencao();
  console.log(`\n\n=== Concluido: ${novos} noticias novas, ${removidos} antigas removidas ===\n`);
}

main().catch((err) => {
  console.error("Erro fatal na coleta:", err);
  process.exit(1);
});
