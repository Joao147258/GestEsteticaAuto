// Dados que o AtualizarServicoUseCase precisa para alterar um serviço.
// Todos os campos do serviço são opcionais: o usuário pode mudar só um deles.
export type AtualizarServicoInput = {
  negocioId: string;
  servicoId: string;
  nome?: string;
  descricao?: string | null;
  categoriaId?: string | null;
  precoBase?: number;
  duracaoEstimadaMinutos?: number | null;
  observacoes?: string | null;
};
