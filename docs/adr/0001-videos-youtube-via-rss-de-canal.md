# Vídeos do YouTube via RSS de canal (sem Data API no MVP)

O GPlay passa a ter collection `videos` alimentada por canais YouTube mapeados a categorias temáticas (Jogos, Futebol, etc.). Precisávamos escolher como descobrir uploads novos.

Decidimos usar o **feed Atom/RSS público de cada canal** (`/feeds/videos.xml?channel_id=...`), no mesmo espírito do coletor de notícias, e **não** a YouTube Data API no lançamento. Motivos: sem quota nem chave obrigatória no CI, padrão já dominado em `scripts/coletar.ts`, e `categoriaRelacionada` estável via config do canal. A YouTube Data API (busca por termos das manchetes) fica como evolução opcional se a relevância “do dia” passar a ser requisito.

**Considered options:** (1) RSS por canal — escolhida; (2) Data API com busca derivada das notícias coletadas — rejeitada no MVP por custo operacional e ruído; (3) curadoria manual — rejeitada por não escalar com Actions a cada 1h.

**Consequences:** vídeos podem não espelhar a manchete exata do dia; Futebol com dois canais (ge + CazéTV) compete pelos mesmos cinco slots do acervo; títulos em inglês em canais EN permanecem sem tradução.
