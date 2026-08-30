import { IsOptional, IsString } from 'class-validator';

// Body da rota POST /admin/orcamentos/:id/recusar.
// A Application aceita apenas negocioId + motivo (opcional) — o campo
// observacao não existe no RecusarOrcamentoDTO, então não é exposto no HTTP.
// negocioId no body (regra temporária sem autenticação).
export class RecusarOrcamentoDto {
  @IsString()
  negocioId: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}
