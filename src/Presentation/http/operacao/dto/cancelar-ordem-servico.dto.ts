import { IsNotEmpty, IsString } from 'class-validator';

// CancelarOrdemServicoDto — valida a requisição de cancelamento de uma Ordem de Serviço.
// O motivo é estritamente obrigatório pois passa a integrar o histórico auditável da OS.
// O cancelamento é uma ação imutável e mantém a integridade do histórico operacional.
// Conversa com o endpoint POST /admin/ordens-servico/:id/cancelar.
export class CancelarOrdemServicoDto {
  @IsString({ message: 'negocioId deve ser uma string válida' })
  @IsNotEmpty({ message: 'negocioId é obrigatório para cancelar a ordem de serviço' })
  negocioId: string;

  @IsString({ message: 'motivo deve ser uma string válida' })
  @IsNotEmpty({ message: 'motivo é obrigatório para cancelamento da ordem de serviço' })
  motivo: string;
}
