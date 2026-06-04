import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

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

/**
 * Para cada chave com acervo cheio (>= maxPorChave), retorna o publicado (ms) do item
 * mais antigo ainda retido. Itens do feed mais velhos que isso são ignorados na coleta.
 */
export function limiarPublicadoRetido(
  dir: string,
  maxPorChave: number,
  lerMeta: (arq: string) => { chave: string; publicado: number } | null,
): Map<string, number> {
  const porChave = new Map<string, number[]>();

  for (const arq of listarArquivosMd(dir)) {
    const meta = lerMeta(arq);
    if (!meta) continue;
    const lista = porChave.get(meta.chave) ?? [];
    lista.push(meta.publicado);
    porChave.set(meta.chave, lista);
  }

  const limiar = new Map<string, number>();
  for (const [chave, publicados] of porChave) {
    if (publicados.length < maxPorChave) continue;
    publicados.sort((a, b) => b - a);
    limiar.set(chave, publicados[maxPorChave - 1]!);
  }

  return limiar;
}
