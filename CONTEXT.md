# GPlay Newsletter

Jornal digital em PT-BR que agrega notícias por tema e cobre eventos especiais. O glossário define o vocabulário do produto, sem detalhes de implementação.

## Language

**Categoria temática**:
Um dos eixos editoriais fixos do jornal: Jogos, Futebol, Tecnologia, IA ou Filmes.
_Evit_: tema, tag genérica, seção YouTube.

**Notícia**:
Matéria agregada de veículo externo (título, resumo, link, thumbnail); pertence a exatamente uma categoria temática.
_Evit_: artigo, post, vídeo.

**Vídeo**:
Conteúdo hospedado no YouTube, com identificador do vídeo, canal e metadados próprios; vive na collection `videos`, não em `noticias`.
_Evit_: notícia com link do YouTube, embed solto.

**Acervo de vídeos**:
No máximo cinco vídeos retidos por categoria relacionada (os mais recentes), somando todos os canais daquele tema; deduplicação por id do vídeo.
_Evit_: limite global único de vinte; cinco vídeos por canal.

**Canal YouTube (fonte)**:
Canal configurado que alimenta a coleta; cada canal declara exatamente uma categoria relacionada.
_Evit_: canal “global” sem tema; misturar RSS de notícia com canal de vídeo no mesmo registro.

**Coleta**:
Rotina única (`coletar`) que atualiza notícias e vídeos na mesma execução e cadência (ex.: a cada uma hora).
_Evit_: pipeline só de vídeo desacoplado da coleta de notícias no agendamento.

**Categoria YouTube**:
Área de navegação e página que lista vídeos; não é categoria temática de notícia. No menu principal aparece como link **YouTube** (entre Filmes e Eventos), rota `/categoria/youtube`; não entra no subtítulo do masthead das cinco temáticas.
_Evit_: sexta categoria em `noticias`; rótulo genérico “Vídeos” sem indicar origem.

**Página do vídeo**:
Página própria no site com player incorporado (YouTube), metadados do vídeo e link para assistir no YouTube.
_Evit_: apenas redirecionar para youtube.com sem página no GPlay.

**Título do vídeo**:
Texto exibido igual ao publicado no YouTube, sem tradução automática.
_Evit_: forçar PT-BR na interface.

**Categoria relacionada**:
Categoria temática à qual um vídeo se aplica editorialmente (ex.: review de jogo → Jogos).
_Evit_: categoria do vídeo (YouTube).

**Destaque na capa**:
Seção na página inicial com os vídeos mais recentes (três itens: um em destaque e dois menores), posicionada depois de **Manchetes** e antes de **Mais recentes**; mistura todas as categorias relacionadas.
_Evit_: vídeo na manchete principal; carrossel só na capa sem página dedicada.

**Vídeos na categoria temática**:
Bloco no fim da página de uma categoria temática (ex. Futebol) com até três vídeos cuja categoria relacionada é aquela tema.
_Evit_: listar os cinco do acervo inteiro na página temática; misturar vídeos de outros temas.

## Relationships

- Uma **Notícia** pertence a exatamente uma **categoria temática**.
- Um **Vídeo** pertence à **categoria YouTube** na navegação, referencia exatamente uma **categoria relacionada**, e o **acervo de vídeos** aplica limite de cinco por categoria relacionada.
- Um clique em **vídeo** na capa ou na listagem abre a **página do vídeo** correspondente.
- A página de uma **categoria temática** pode exibir **vídeos na categoria temática** (até três) além das notícias daquele tema.
- A **capa** exibe manchetes de **notícias**, depois **destaque na capa** (três **vídeos**), depois o restante do fluxo editorial.

**Rodapé (conteúdo)**:
Texto legal em duas partes: uma para notícias agregadas via RSS e outra para vídeos incorporados do YouTube.
_Evit_: um único parágrafo que não distingue notícia de vídeo.

## Example dialogue

> **Dev:** "Um link do YouTube chegou no RSS de Tecnologia. Vira notícia?"
> **Editor:** "Não — isso é **notícia** só se for matéria de site (resumo + link do veículo). Trailer ou review em canal vira **vídeo**, com **categoria relacionada** Tecnologia, e pode aparecer no **destaque na capa**."

## Flagged ambiguities

- (resolvido) **Categoria relacionada** na coleta: vem da configuração do **canal YouTube**. Evolução futura: boost por manchetes (híbrido).
- (resolvido) **Canais no MVP:** Jogos → PlayStation Brasil; Futebol → ge **e** CazéTV (única categoria com dois canais); Tecnologia → TecMundo; IA → Two Minute Papers; Filmes → CinePOP. Ajustes finos de channel ID ficam na config, não no glossário.
