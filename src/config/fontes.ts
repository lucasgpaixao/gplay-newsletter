export type Categoria = "Jogos" | "Futebol" | "Tecnologia" | "IA" | "Filmes";

export interface Fonte {
  nome: string;
  url: string;
  idioma: "pt" | "en";
  categoria: Categoria;
}

/**
 * Fontes RSS por categoria.
 * idioma "en" sera traduzido para PT-BR na coleta (titulo + resumo).
 * Ajuste/adicione feeds aqui conforme necessario.
 */
export const FONTES: Fonte[] = [
  // ---------------- Jogos ----------------
  { nome: "IGN Brasil", url: "https://br.ign.com/feed.xml", idioma: "pt", categoria: "Jogos" },
  { nome: "Adrenaline (Games)", url: "https://www.adrenaline.com.br/games/feed/", idioma: "pt", categoria: "Jogos" },
  { nome: "Push Square", url: "https://www.pushsquare.com/feeds/latest", idioma: "en", categoria: "Jogos" },
  { nome: "IGN", url: "https://feeds.feedburner.com/ign/games-all", idioma: "en", categoria: "Jogos" },

  // ---------------- Futebol ----------------
  { nome: "ge.globo", url: "https://pox.globo.com/rss/ge/futebol", idioma: "pt", categoria: "Futebol" },
  { nome: "Gazeta Esportiva", url: "https://www.gazetaesportiva.com/feed/", idioma: "pt", categoria: "Futebol" },
  { nome: "Trivela", url: "https://trivela.com.br/feed/", idioma: "pt", categoria: "Futebol" },

  // ---------------- Tecnologia ----------------
  { nome: "Tecmundo", url: "https://rss.tecmundo.com.br/feed", idioma: "pt", categoria: "Tecnologia" },
  { nome: "Olhar Digital", url: "https://olhardigital.com.br/feed/", idioma: "pt", categoria: "Tecnologia" },
  { nome: "Canaltech", url: "https://canaltech.com.br/rss/", idioma: "pt", categoria: "Tecnologia" },
  { nome: "The Verge", url: "https://www.theverge.com/rss/index.xml", idioma: "en", categoria: "Tecnologia" },

  // ---------------- IA ----------------
  { nome: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/", idioma: "en", categoria: "IA" },
  { nome: "MIT Technology Review (AI)", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed", idioma: "en", categoria: "IA" },
  { nome: "Ars Technica (AI)", url: "https://arstechnica.com/ai/feed/", idioma: "en", categoria: "IA" },

  // ---------------- Filmes ----------------
  { nome: "Cinema com Rapadura", url: "https://cinemacomrapadura.com.br/feed/", idioma: "pt", categoria: "Filmes" },
  { nome: "Legiao dos Herois", url: "https://www.legiaodosherois.com.br/feed", idioma: "pt", categoria: "Filmes" },
  { nome: "Variety", url: "https://variety.com/feed/", idioma: "en", categoria: "Filmes" },
];

export const CORES_CATEGORIA: Record<Categoria, string> = {
  Jogos: "#7c3aed",
  Futebol: "#16a34a",
  Tecnologia: "#2563eb",
  IA: "#db2777",
  Filmes: "#ea580c",
};
