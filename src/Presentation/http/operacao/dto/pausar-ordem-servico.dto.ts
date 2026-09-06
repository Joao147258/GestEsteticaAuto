import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// PausarOrdemServicoDto — valida a requisição de pausa de execução de uma OS em andamento.
// Permite informar opcionalmente o motivo da interrupção para fins de registro operacional.
export class PausarOrdemServicoDto {
  @IsString({ message: 'negocioId deve ser uma string válida' })
  @IsNotEmpty({ message: 'negocioId é obrigatório para pausar a ordem de serviço' })
  negocioId: string;

  @IsOptional()
  @IsString({ message: 'motivo deve ser uma string válida' })
  motivo?: string;
}
