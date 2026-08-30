import { IsOptional, IsString } from 'class-validator';

// Body da rota POST /admin/orcamentos/:id/cancelar.
// A Application aceita apenas negocioId + motivo (opcional) — o campo
// observacao não existe no CancelarOrcamentoDTO, então não é exposto no HTTP.
// negocioId no body (regra temporária sem autenticação).
export class CancelarOrcamentoDto {
  @IsString()
  negocioId: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}
