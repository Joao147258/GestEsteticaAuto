import { IsOptional, IsString } from 'class-validator';

// Body da rota POST /admin/orcamentos/:id/aprovar.
// Permite registrar ou confirmar a forma e condição de pagamento acordadas com o cliente.
export class AprovarOrcamentoDto {
  @IsString()
  negocioId: string;

  @IsOptional()
  @IsString()
  formaPagamentoPrevista?: string;

  @IsOptional()
  @IsString()
  condicaoPagamento?: string;

  @IsOptional()
  @IsString()
  observacaoPagamento?: string;
}
