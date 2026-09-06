import { IsNotEmpty, IsString } from 'class-validator';

// DTO HTTP para query params da listagem de movimentações do estoque interno.
// Rota: GET /admin/estoque-interno/:produtoId/movimentacoes
export class ListarMovimentacoesEstoqueInternoQueryDto {
  @IsString()
  @IsNotEmpty()
  negocioId: string;
}
