import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// ConcluirOrdemServicoDto — valida a requisição de conclusão da execução de uma OS.
// Exige negocioId e permite observação técnica de encerramento dos trabalhos no veículo.
export class ConcluirOrdemServicoDto {
  @IsString({ message: 'negocioId deve ser uma string válida' })
  @IsNotEmpty({ message: 'negocioId é obrigatório para concluir a ordem de serviço' })
  negocioId: string;

  @IsOptional()
  @IsString({ message: 'observacaoConclusao deve ser uma string válida' })
  observacaoConclusao?: string;
}
