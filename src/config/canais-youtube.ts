import type { Categoria } from "./fontes.ts";

export interface CanalYouTube {
  nome: string;
  channelId: string;
  categoriaRelacionada: Categoria;
}

/** Feed Atom: https://www.youtube.com/feeds/videos.xml?channel_id=... */
export function urlFeedCanal(channelId: string): string {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
}

/**
 * Canais YouTube por categoria temática (MVP).
 * Futebol: ge tv + CazéTV (compartilham o limite de 5 vídeos do tema).
 */
export const CANAIS_YOUTUBE: CanalYouTube[] = [
  {
    nome: "PlayStation Brasil",
    channelId: "UC6i4mzH3OPrZV0p64zoz-Ww",
    categoriaRelacionada: "Jogos",
  },
  {
    nome: "ge tv",
    channelId: "UCgCKagVhzGnZcuP9bSMgMCg",
    categoriaRelacionada: "Futebol",
  },
  {
    nome: "CazéTV",
    channelId: "UCPHXtOVmjvbP9OJihsd7gCg",
    categoriaRelacionada: "Futebol",
  },
  {
    nome: "TecMundo",
    channelId: "UCdmGjywrxeOPfC7vDllmSgQ",
    categoriaRelacionada: "Tecnologia",
  },
  {
    nome: "Two Minute Papers",
    channelId: "UCbfYPyITQ-7l4upoX8nvctg",
    categoriaRelacionada: "IA",
  },
  {
    nome: "CinePOP",
    channelId: "UCtW6JCKs-OGy1C-Dcx5W23A",
    categoriaRelacionada: "Filmes",
  },
];

export const COR_YOUTUBE = "#c4302b";
export const NAV_YOUTUBE = "YouTube";
