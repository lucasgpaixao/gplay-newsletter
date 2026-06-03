# Coleta acelerada condicional no GitHub Actions

Durante **ao vivo (evento)** do **evento em foco**, a cobertura precisa atualizar mais rápido que o cron horário, sem aumentar custo o mês inteiro.

Adicionamos o workflow `coletar-acelerada.yml` (cron `*/20` UTC) que só executa `npm run coletar` quando `scripts/deve-coletar-acelerada.ts` confirma evento marcado com foco entre **início** e **fim**. A lógica espelha `src/lib/eventos-core.ts` (sem Astro). O workflow horário permanece; ambos usam `concurrency.group: coletar` para serializar commits.

**Considered options:** (1) cron fixo 20 min com gate no script — escolhida; (2) acelerar o cron horário globalmente — rejeitada; (3) Vercel on-demand rebuild sem commit — rejeitada (acervo vive no git).

**Consequences:** fora da janela ao vivo do foco, o workflow roda mas sai em segundos; a UI do evento em foco ao vivo declara intervalo ~20 min.
