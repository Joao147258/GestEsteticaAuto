import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// AtualizarOrdemServicoDto — valida a atualização de dados operacionais (observações e previsões).
// O negocioId é obrigatório para garantir isolamento multi-tenant.
// As alterações de status não passam por este DTO e sim por rotas dedicadas de ciclo de vida.
// Conversa com o endpoint PATCH /admin/ordens-servico/:id.
export class AtualizarOrdemServicoDto {
  @IsString({ message: 'negocioId deve ser uma string válida' })
  @IsNotEmpty({ message: 'negocioId é obrigatório para atualizar a ordem de serviço' })
  negocioId: string;

  @IsOptional()
  @IsString({ message: 'observacoes deve ser uma string' })
  observacoes?: string;

  @IsOptional()
  @IsDateString({}, { message: 'previsaoInicio deve ser uma data ISO válida' })
  previsaoInicio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'previsaoConclusao deve ser uma data ISO válida' })
  previsaoConclusao?: string;
}
