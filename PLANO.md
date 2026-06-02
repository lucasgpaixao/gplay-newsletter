# Plano — GPlay Newsletter

Decisões fechadas na fase de planejamento (entrevista), para referência futura.

## Visão

Jornal digital em PT-BR agregando notícias de **Jogos, Futebol, Tecnologia, IA e Filmes**, com cobertura especial de eventos (State of Play, Summer Game Fest, PC Gaming Show, Xbox Showcase, Copa do Mundo 2026).

## Decisões de arquitetura

| Tema | Decisão |
|---|---|
| Produto | Site estático estilo jornal; conteúdo como arquivos no projeto (sem Obsidian/vault, sem banco) |
| Stack | Node.js + TypeScript |
| Fonte de notícias | RSS por categoria (API de agregação fica como opção futura) |
| O que armazenar | Título + resumo + link + thumbnail (não o artigo completo — respeita direitos autorais) |
| Tradução | Removida — o conteúdo é exibido no idioma original do feed |
| Gerador do site | Astro (content collections) |
| Eventos | Notas curadas manualmente com countdown + agregação de notícias por `keywords` |
| Coleta | `npm run coletar` manual + GitHub Actions agendada (a cada 6h) |
| Deploy | Vercel (republica a cada push) |
| Imagens | Hotlink da thumbnail do feed + placeholder colorido por categoria |
| Ciclo de vida | Dedupe por `guid`/link + retenção de ~30 dias |
| Visual | Híbrido: masthead "GPlay Newsletter" + data da edição, cards modernos, dark mode, responsivo, UI 100% PT-BR |

## Estrutura

```
src/
  config/fontes.ts        # feeds RSS por categoria
  content/
    config.ts             # schema das collections (noticias, eventos)
    noticias/<Cat>/<AAAA-MM>/AAAA-MM-DD-slug.md
    eventos/*.md
  lib/                    # slug, texto, traducao, datas, conteudo
  components/             # CardNoticia, EventoCard
  layouts/Base.astro      # masthead, nav, dark mode, countdown, toggle de traducao
  pages/                  # capa, categoria/[categoria], noticia/[...slug], eventos
scripts/coletar.ts        # coletor RSS + traducao + dedupe + retencao
.github/workflows/coletar.yml
```

## Pendências / ideias futuras

- (Opcional) Adicionar API de agregação para categorias com pouca cobertura.
- (Opcional) Busca, paginação de arquivo, feed RSS próprio do GPlay.
