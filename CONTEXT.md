# GPlay Newsletter

Jornal digital em PT-BR que agrega notícias por tema e cobre eventos especiais. O glossário define o vocabulário do produto, sem detalhes de implementação.

## Language

**Prioridade de uso**:
O leitor vem primeiro para acompanhar um **evento** em andamento ou próximo; a **capa** funciona como **edição do dia** quando não há evento no foco.
_Evit_: tratar o site só como feed genérico de categorias; priorizar vídeo ou notícia solta acima do evento sem contexto.

**Edição do dia**:
Recorte editorial da **capa** na data corrente: manchetes e fluxo “mais recentes” como panorama do que mudou desde a última visita.
_Evit_: arquivo histórico completo; newsletter por e-mail (produto distinto, se existir no futuro).

**Evento**:
Cobertura especial curada (nome, datas, palavras-chave, link oficial); agrega **notícias** relacionadas por correspondência de texto nas palavras-chave.
_Evit_: evento como categoria temática; evento sem data de início.

**Evento em foco**:
Único **evento** em hero na **capa** (countdown + amostra de cobertura); sempre o **próximo** na fila entre os não **encerrados** (menor data de **início**).
_Evit_: três cards de evento com peso igual na **capa**; escolha manual por flag no markdown; confundir com **destaque na capa** (bloco de vídeos).

**Teaser de evento (capa)**:
Card compacto na **capa** quando não há **evento em foco** válido, mas existe **evento** com **início** nos próximos sete dias; aponta para a **página do evento** ou `/eventos`.
_Evit_: hero completo sem candidato a foco; omitir o calendário quando há showcase em menos de uma semana.

**Página do evento**:
Landing de um **evento** com countdown, cobertura agregada e link oficial; destino do hero do **evento em foco** na **capa**.
_Evit_: cobertura só na listagem geral de `/eventos` sem URL própria.

**Cobertura do evento**:
**Notícias** e **vídeos** exibidos na **página do evento** quando título ou resumo (e, para **vídeo**, título) coincidem com as palavras-chave do **evento**.
_Evit_: todos os itens da **categoria temática** do **evento** sem filtro; curadoria manual item a item no MVP.

**Ao vivo (evento)**:
Período entre o **início** e o **fim** do **evento** em que a **página do evento** sinaliza que está acontecendo agora e prioriza atualizar a **cobertura do evento** para o leitor que acompanha em tempo quase real.
_Evit_: “ao vivo” só no countdown antes do horário; misturar com transmissão hospedada no GPlay.

**Atualização ao vivo (comunicação)**:
Durante **ao vivo (evento)** do **evento em foco**, a interface declara intervalo ~20 min e exibe o horário da última **coleta**; fora desse modo ou fora do foco, o ritmo padrão é ~1 h.
_Evit_: prometer tempo real ou refresh automático sem novo deploy; esconder que o site é estático.

**Coleta acelerada (evento)**:
Cadência de **coleta** a cada ~20 minutos no CI, somente para o **evento em foco** entre **início** e **fim**; a **atualização ao vivo (comunicação)** no site reflete esse intervalo no hero e na **página do evento** em ao vivo.
_Evit_: cron agressivo o mês inteiro; acelerar para todos os **eventos** em paralelo.

**Evento encerrado**:
**Evento** cujo **fim** já passou; deixa de ser candidato a **evento em foco** na **capa**; a **página do evento** permanece como arquivo com **cobertura congelada**.
_Evit_: manter hero na **capa** até remoção manual da marcação; apagar a **página do evento**.

**Cobertura congelada**:
Conjunto fixo de **notícias** e **vídeos** no **evento encerrado**: permanecem todos os itens que já faziam parte da **cobertura do evento** (sem filtrar por data de publicação); depois do **fim**, nenhum item novo entra, mesmo que case com as palavras-chave.
_Evit_: cortar da lista matérias publicadas após o **fim**; continuar agregando por keywords após encerrar.

**Categoria temática**:
Um dos eixos editoriais fixos do jornal: Jogos, Futebol, Tecnologia, IA ou Filmes.
_Evit_: tema, tag genérica, seção YouTube.

**Notícia**:
Matéria agregada de veículo externo (título, resumo, link, thumbnail); pertence a exatamente uma categoria temática.
_Evit_: artigo, post, vídeo.

**Vídeo**:
Conteúdo hospedado no YouTube, com identificador do vídeo, canal e metadados próprios; vive na collection `videos`, não em `noticias`.
_Evit_: notícia com link do YouTube, embed solto.

**Acervo de notícias**:
No máximo vinte matérias retidas por categoria temática (as mais recentes), somando todos os feeds daquele tema; deduplicação por `guid`.
_Evit_: vinte notícias por feed ou por veículo; limite global único cortando todas as categorias juntas.

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
- A **capa** exibe no máximo um **evento em foco** quando houver **evento** não **encerrado** (o de **início** mais próximo); senão, **teaser de evento (capa)** se houver **início** em até sete dias; senão, só **edição do dia** (manchetes, **destaque na capa** de **vídeos**, demais blocos).
- Um **evento** agrega **cobertura do evento** (**notícias** e **vídeos**) via palavras-chave; a **página do evento** concentra essa cobertura e pode entrar em **ao vivo (evento)** entre **início** e **fim**.
- O hero do **evento em foco** na **capa** aponta para a **página do evento** correspondente; **eventos encerrados** não ocupam o hero.
- Após encerrar, a **cobertura do evento** vira **cobertura congelada** na **página do evento**.

**Rodapé (conteúdo)**:
Texto legal em duas partes: uma para notícias agregadas via RSS e outra para vídeos incorporados do YouTube.
_Evit_: um único parágrafo que não distingue notícia de vídeo.

## Example dialogue

> **Dev:** "Copa e Xbox Showcase no mesmo mês. Qual vai na capa?"
> **Editor:** "Sempre o **próximo** não **encerrado** — menor **início**. Summer Game Fest antes do Xbox; depois o showcase seguinte. Sem flag manual no markdown."

> **Dev:** "Saiu notícia do showcase à meia-noite. O evento já encerrou. Entra no arquivo?"
> **Editor:** "Não — **cobertura congelada**. Só entra o que já estava na **cobertura do evento** antes do **fim**. Sem cortar por data de publicação o que já listamos."

> **Dev:** "Um link do YouTube chegou no RSS de Tecnologia. Vira notícia?"
> **Editor:** "Não — isso é **notícia** só se for matéria de site (resumo + link do veículo). Trailer ou review em canal vira **vídeo**, com **categoria relacionada** Tecnologia, e pode aparecer no **destaque na capa**."

## Flagged ambiguities

- (resolvido) **Prioridade de uso**: evento (B) com **edição do dia** (A) na **capa** quando não há **evento em foco**.
- (resolvido) **Evento em foco na capa**: automaticamente o **próximo** não **encerrado** (menor **início**).
- (resolvido) **Página do evento**: **cobertura do evento** (notícias + vídeos por palavras-chave) + **ao vivo (evento)** entre início e fim.
- (resolvido) **Após o fim**: **evento encerrado** — sai do hero automaticamente; **página do evento** permanece com **cobertura congelada**.
- (resolvido) **Cobertura congelada**: sem corte de data nos itens já listados; após o **fim**, a cobertura só deixa de crescer (nada novo entra).
- (resolvido) **Ao vivo (comunicação + ritmo)**: banner com expectativa clara + horário da última coleta; **coleta acelerada (evento)** em janela ao vivo (~15–30 min).
- (resolvido) **Coleta acelerada**: só o **evento em foco**, só entre **início** e **fim**.
- (resolvido) **Capa sem foco**: **teaser de evento (capa)** se **início** ≤ 7 dias; caso contrário, sem bloco de **evento** na **capa**.
- (resolvido) **Pacote eventos (código)**: foco + teaser + **página do evento** + cobertura (notícias/vídeos) + ao vivo + congelar + commit de **vídeos** no CI + **coleta acelerada** (~20 min) para o **evento em foco** ao vivo.
- (resolvido) **Foco automático**: campo `destaque` no markdown de **evento** deixou de dirigir a capa (legado opcional no schema).
- (resolvido) **Categoria relacionada** na coleta: vem da configuração do **canal YouTube**. Evolução futura: boost por manchetes (híbrido).
- (resolvido) **Canais no MVP:** Jogos → PlayStation Brasil; Futebol → ge **e** CazéTV (única categoria com dois canais); Tecnologia → TecMundo; IA → Two Minute Papers; Filmes → CinePOP. Ajustes finos de channel ID ficam na config, não no glossário.
