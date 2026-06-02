/** Atributos de carregamento para imagem hero (LCP) em pagina de artigo. */
export const attrsImagemHero = {
  loading: "eager" as const,
  fetchpriority: "high" as const,
  decoding: "async" as const,
};

/** Atributos para thumbnail de card (abaixo da dobra ou secundaria). */
export function attrsImagemCard(opcoes: { lcp?: boolean } = {}) {
  if (opcoes.lcp) {
    return {
      loading: "eager" as const,
      fetchpriority: "high" as const,
      decoding: "async" as const,
    };
  }
  return {
    loading: "lazy" as const,
    decoding: "async" as const,
  };
}
