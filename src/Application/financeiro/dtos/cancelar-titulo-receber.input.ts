// Entrada do CancelarTituloReceberUseCase.
// Cancelamento financeiro exige motivo — cancelar sem justificativa gera
// histórico ruim. A regra de "pode cancelar" (não pago, sem pagamento
// confirmado) é do domínio.
export type CancelarTituloReceberInput = {
  negocioId: string;
  tituloId: string;
  motivo: string;
};
