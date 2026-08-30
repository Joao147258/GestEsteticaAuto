import { IsString } from 'class-validator';

// Body da rota DELETE /admin/orcamentos/:id/itens/:itemId.
// RemoverItemOrcamentoDTO da Application exige negocioId + orcamentoId +
// itemId. orcamentoId e itemId vêm do path; negocioId no body (regra
// temporária sem auth).
export class RemoverItemOrcamentoDto {
  @IsString()
  negocioId: string;
}
