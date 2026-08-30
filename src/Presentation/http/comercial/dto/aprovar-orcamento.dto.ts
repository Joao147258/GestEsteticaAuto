import { IsString } from 'class-validator';

// Body da rota POST /admin/orcamentos/:id/aprovar.
// AprovarOrcamentoDTO da Application exige apenas negocioId + orcamentoId.
// orcamentoId vem do path; negocioId no body (regra temporária sem auth).
export class AprovarOrcamentoDto {
  @IsString()
  negocioId: string;
}
