# GPlay Newsletter

Jornal digital de notícias agregadas sobre **Jogos, Futebol, Tecnologia, IA e Filmes**, em português. Conteúdo coletado automaticamente de feeds RSS. A seção **YouTube** traz vídeos recentes de canais ligados a cada tema. Eventos especiais (State of Play, Summer Game Fest, Copa do Mundo etc.) ganham contagem regressiva e cobertura dedicada.

Site estático feito com **Astro + TypeScript**. As notícias vivem como arquivos Markdown no próprio projeto (sem banco de dados).

## Como funciona

1. `npm run coletar` lê os feeds em `src/config/fontes.ts` e os canais em `src/config/canais-youtube.ts`.
2. Cada notícia vira um `.md` em `src/content/noticias/<Categoria>/<AAAA-MM>/`.
3. Cada vídeo vira um `.md` em `src/content/videos/<CategoriaRelacionada>/<AAAA-MM>/`.
4. Deduplica por `guid` e mantém até **20 notícias** e **5 vídeos** por categoria temática (os mais recentes).
5. O Astro gera o site (capa, categorias, artigo, vídeos, eventos) a partir desses arquivos.

## Rodando localmente

```bash
npm install
cp .env.example .env      # opcional
npm run coletar           # popula as notícias
npm run dev               # http://localhost:4321
```

Outros comandos:

```bash
npm run coletar:limpar    # apaga o acervo e recoleta do zero
npm run build             # gera o site estático em dist/
npm run preview           # pré-visualiza o build
```

## Retenção do acervo

O limite está em `src/lib/noticias-limites.ts` (`MAX_NOTICIAS_POR_CATEGORIA = 20`). O coletor e o build do Astro usam o mesmo valor.

## Fontes

Edite `src/config/fontes.ts` para adicionar/remover feeds RSS. Cada fonte tem `nome`, `url`, `idioma` (`pt`/`en`, apenas informativo) e `categoria`.

## Vídeos (YouTube)

Canais em `src/config/canais-youtube.ts` (`channelId` + `categoriaRelacionada`). Coleta via feed Atom público do YouTube, sem API key.

## Deploy (GitHub + Vercel)

1. Crie um repositório no GitHub e faça push deste projeto.
2. Em [vercel.com](https://vercel.com) → **Add New Project** → importe o repositório. O framework Astro é detectado automaticamente (build `npm run build`, saída `dist`).
3. A coleta automática roda via **GitHub Actions** (`.github/workflows/coletar.yml`) a cada 1h: ela commita as notícias novas e a Vercel republica sozinha.

## Eventos

Arquivos em `src/content/eventos/*.md`. Cada evento tem data/hora, `keywords` (para puxar notícias relacionadas) e `confirmado`. Edite as datas conforme forem anunciadas oficialmente.

## Aviso legal

Agregador de notícias: armazena apenas título, resumo e link, sempre creditando e direcionando ao veículo de origem. As imagens são exibidas direto da fonte (hotlink).
