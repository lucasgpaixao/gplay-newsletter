# GPlay Newsletter

Jornal digital de notícias agregadas sobre **Jogos, Futebol, Tecnologia, IA e Filmes**, em português. Conteúdo coletado automaticamente de feeds RSS. Eventos especiais (State of Play, Summer Game Fest, Copa do Mundo etc.) ganham contagem regressiva e cobertura dedicada.

Site estático feito com **Astro + TypeScript**. As notícias vivem como arquivos Markdown no próprio projeto (sem banco de dados).

## Como funciona

1. `npm run coletar` lê os feeds em `src/config/fontes.ts`.
2. Cada notícia vira um `.md` em `src/content/noticias/<Categoria>/<AAAA-MM>/`.
3. Deduplica por `guid`/link e mantém até **20 notícias por categoria** (as mais recentes), alinhado ao site.
4. O Astro gera o site (capa, categorias, artigo, eventos) a partir desses arquivos.

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

Edite `src/config/fontes.ts` para adicionar/remover feeds. Cada fonte tem `nome`, `url`, `idioma` (`pt`/`en`, apenas informativo) e `categoria`.

## Deploy (GitHub + Vercel)

1. Crie um repositório no GitHub e faça push deste projeto.
2. Em [vercel.com](https://vercel.com) → **Add New Project** → importe o repositório. O framework Astro é detectado automaticamente (build `npm run build`, saída `dist`).
3. A coleta automática roda via **GitHub Actions** (`.github/workflows/coletar.yml`) a cada 6h: ela commita as notícias novas e a Vercel republica sozinha.

## Eventos

Arquivos em `src/content/eventos/*.md`. Cada evento tem data/hora, `keywords` (para puxar notícias relacionadas) e `confirmado`. Edite as datas conforme forem anunciadas oficialmente.

## Aviso legal

Agregador de notícias: armazena apenas título, resumo e link, sempre creditando e direcionando ao veículo de origem. As imagens são exibidas direto da fonte (hotlink).
