import { IsNotEmpty, IsString } from 'class-validator';

// GerarOrdemServicoDto — valida a requisição para geração de OS a partir de orçamento aprovado.
// O negocioId e orcamentoId são estritamente obrigatórios para garantir multi-tenant e rastreabilidade.
// Conversa com o endpoint POST /admin/ordens-servico.
export class GerarOrdemServicoDto {
  @IsString({ message: 'negocioId deve ser uma string válida' })
  @IsNotEmpty({ message: 'negocioId é obrigatório para gerar a ordem de serviço' })
  negocioId: string;

  @IsString({ message: 'orcamentoId deve ser uma string válida' })
  @IsNotEmpty({ message: 'orcamentoId é obrigatório para referenciar o orçamento aprovado' })
  orcamentoId: string;
}
