// Dados que o CriarServicoUseCase precisa para criar um serviço no catálogo.
// O domínio exige negocioId, nome e precoBase; os demais são opcionais.
export type CriarServicoInput = {
  negocioId: string;
  nome: string;
  precoBase: number;
  descricao?: string | null;
  categoriaId?: string | null;
  duracaoEstimadaMinutos?: number | null;
  observacoes?: string | null;
};
