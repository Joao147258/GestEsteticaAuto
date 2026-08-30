import { IsString } from 'class-validator';

// Body da rota POST /admin/orcamentos/:id/abrir.
// AbrirOrcamentoDTO da Application exige apenas negocioId + orcamentoId.
// orcamentoId vem do path; negocioId no body (regra temporária sem auth).
export class AbrirOrcamentoDto {
  @IsString()
  negocioId: string;
}
