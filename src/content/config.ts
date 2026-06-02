import { defineCollection, z } from "astro:content";

export const CATEGORIAS = [
  "Jogos",
  "Futebol",
  "Tecnologia",
  "IA",
  "Filmes",
] as const;

const noticias = defineCollection({
  type: "content",
  schema: z.object({
    titulo: z.string(),
    resumo: z.string().default(""),
    categoria: z.enum(CATEGORIAS),
    fonte: z.string(),
    link: z.string().url(),
    imagem: z.string().url().optional(),
    autor: z.string().optional(),
    publicado: z.coerce.date(),
    coletado: z.coerce.date(),
    guid: z.string(),
  }),
});

const videos = defineCollection({
  type: "content",
  schema: z.object({
    titulo: z.string(),
    categoriaRelacionada: z.enum(CATEGORIAS),
    canal: z.string(),
    videoId: z.string().regex(/^[a-zA-Z0-9_-]{11}$/),
    link: z.string().url(),
    thumbnail: z.string().url(),
    publicado: z.coerce.date(),
    coletado: z.coerce.date(),
    guid: z.string(),
  }),
});

const eventos = defineCollection({
  type: "content",
  schema: z.object({
    nome: z.string(),
    descricao: z.string().default(""),
    categoria: z.enum(CATEGORIAS),
    inicio: z.coerce.date(),
    fim: z.coerce.date().optional(),
    confirmado: z.boolean().default(true),
    link: z.string().url().optional(),
    keywords: z.array(z.string()).default([]),
    destaque: z.boolean().default(false),
  }),
});

export const collections = { noticias, videos, eventos };
