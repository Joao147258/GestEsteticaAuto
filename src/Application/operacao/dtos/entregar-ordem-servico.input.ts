// Entrada do EntregarOrdemServicoUseCase.
// Não carrega status: quem decide se a OS pode ser entregue é o Domain
// (OrdemServico.entregar() — apenas CONCLUIDA). O DTO apenas carrega a
// intenção "entregar esta OS ao cliente".
export type EntregarOrdemServicoInput = {
  negocioId: string;
  ordemServicoId: string;
};
