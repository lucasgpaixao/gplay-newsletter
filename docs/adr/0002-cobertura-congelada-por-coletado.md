# Cobertura congelada sem snapshot persistido

Após o **fim** de um evento, a cobertura não deve crescer (nenhum item novo por keywords), mas itens já exibidos permanecem sem corte por data de publicação.

Implementamos o congelamento filtrando itens cuja data de **coleta** é posterior ao **fim** do evento, em builds onde o evento já está encerrado. Enquanto o evento está ativo, entram todos os matches por keyword.

**Considered options:** (1) `coletado <= fim` após encerrar — escolhida; (2) arquivo JSON de guids no encerramento — rejeitada na onda 1 por exigir job extra ou escrita no CI; (3) corte por `publicado` — rejeitada por remover matérias legítimas já listadas.

**Consequences:** um item coletado após o fim nunca entra (correto); um item coletado antes do fim com `publicado` posterior ainda pode aparecer (alinhado ao glossário).
