/**
 * Detecta noticias de cupom / codigo promocional (ex.: feed do Tecmundo).
 * Nao bloqueia ofertas editoriais de jogos (Steam, Nintendo etc.).
 */
export function ehNoticiaCupomOuCodigoPromo(input: {
  titulo: string;
  link?: string;
}): boolean {
  const titulo = input.titulo.trim();
  const link = (input.link ?? "").toLowerCase();

  if (/^(cupom|código promocional|codigo promocional)\b/i.test(titulo)) {
    return true;
  }

  if (/\|\s*(até|ate)\s*\d+%\s*off\s*-/i.test(titulo)) {
    return true;
  }

  if (
    /\/cupom[-_]|[-/]cupom[-_.]|codigo-promocional|guia-de-compras\/\d+-cupom/i.test(
      link,
    )
  ) {
    return true;
  }

  return false;
}
