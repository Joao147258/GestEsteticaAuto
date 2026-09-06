import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

// RegistrarPagamentoDto — valida a requisição para registrar quitação parcial ou integral de uma parcela.
// O valorPago deve ser estritamente positivo. A data de pagamento é opcional (default para o momento da requisição).
// O negocioId garante que o pagamento seja auditado e aplicado no tenant correto.
// Conversa com o endpoint POST /admin/financeiro/titulos/:id/pagamentos.
export class RegistrarPagamentoDto {
  @IsString({ message: 'negocioId deve ser uma string válida' })
  @IsNotEmpty({ message: 'negocioId é obrigatório' })
  negocioId: string;

  @IsString({ message: 'parcelaId deve ser uma string válida' })
  @IsNotEmpty({ message: 'parcelaId é obrigatório para identificar a parcela a ser baixada' })
  parcelaId: string;

  @IsNumber({}, { message: 'valorPago deve ser numérico' })
  @IsPositive({ message: 'valorPago deve ser maior que zero' })
  valorPago: number;

  @IsOptional()
  @IsString({ message: 'formaPagamentoId deve ser uma string' })
  formaPagamentoId?: string;

  @IsOptional()
  @IsString({ message: 'formaPagamento deve ser uma string descritiva' })
  formaPagamento?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dataPagamento deve ser uma data ISO válida' })
  dataPagamento?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
