// Entrada do IniciarOrdemServicoUseCase.
// Não carrega status: quem decide se a OS pode iniciar é o Domain
// (OrdemServico.iniciar()). O DTO apenas carrega a intenção "iniciar esta OS".
export type IniciarOrdemServicoInput = {
  negocioId: string;
  ordemServicoId: string;
};
