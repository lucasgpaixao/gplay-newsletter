/**
 * Gate para o workflow de coleta acelerada.
 * Exit 0 = rodar coleta; exit 1 = pular (sem evento em foco ao vivo).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { deveColetaAcelerada, type EventoDados } from "../src/lib/eventos-core.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR_EVENTOS = join(__dirname, "..", "src", "content", "eventos");

function parseFrontmatter(md: string): Record<string, string> {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const out: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function carregarEventos(): EventoDados[] {
  const arquivos = readdirSync(DIR_EVENTOS).filter((f) => f.endsWith(".md"));
  const lista: EventoDados[] = [];
  for (const arq of arquivos) {
    const raw = readFileSync(join(DIR_EVENTOS, arq), "utf8");
    const fm = parseFrontmatter(raw);
    const inicio = fm.inicio ? new Date(fm.inicio) : null;
    if (!inicio || Number.isNaN(inicio.getTime())) continue;
    lista.push({
      slug: basename(arq, ".md"),
      inicio,
      fim: fm.fim ? new Date(fm.fim) : undefined,
    });
  }
  return lista;
}

const foco = deveColetaAcelerada(carregarEventos());
if (foco) {
  console.log(`Coleta acelerada: ${foco.slug}`);
  process.exit(0);
}
console.log("Sem evento em foco ao vivo — coleta acelerada ignorada.");
process.exit(1);
