// Entrada do ListarVeiculosUseCase (listagem por negócio).
// clienteId permite listar os veículos de um cliente específico; busca é uma
// palavra-chave para placa/marca/modelo/cor (conforme o repository suportar).
// pagina/limite deixam o contrato preparado para paginação.
export type ListarVeiculosInput = {
  negocioId: string;

  clienteId?: string;
  busca?: string;

  pagina?: number;
  limite?: number;
};
