/** Lógica de eventos sem dependência do Astro (reutilizada no CI). */

export interface EventoDados {
  slug: string;
  inicio: Date;
  fim?: Date;
}

export function fimDoEventoDados(e: Pick<EventoDados, "inicio" | "fim">): Date {
  return e.fim ?? new Date(e.inicio.getTime() + 2 * 60 * 60 * 1000);
}

export function eventoEncerradoDados(
  e: Pick<EventoDados, "inicio" | "fim">,
  agora = Date.now(),
): boolean {
  return fimDoEventoDados(e).getTime() < agora;
}

export function eventoAoVivoDados(
  e: Pick<EventoDados, "inicio" | "fim">,
  agora = Date.now(),
): boolean {
  const ini = e.inicio.getTime();
  const fim = fimDoEventoDados(e).getTime();
  return agora >= ini && agora <= fim;
}

/** Próximo evento na fila: não encerrado, menor data de início. */
export function escolherEventoEmFoco(eventos: EventoDados[], agora = Date.now()): EventoDados | null {
  const candidatos = eventos.filter((e) => !eventoEncerradoDados(e, agora));
  if (!candidatos.length) return null;
  candidatos.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  return candidatos[0];
}

/** Coleta acelerada: evento em foco entre início e fim. */
export function deveColetaAcelerada(eventos: EventoDados[], agora = Date.now()): EventoDados | null {
  const foco = escolherEventoEmFoco(eventos, agora);
  if (!foco || !eventoAoVivoDados(foco, agora)) return null;
  return foco;
}
