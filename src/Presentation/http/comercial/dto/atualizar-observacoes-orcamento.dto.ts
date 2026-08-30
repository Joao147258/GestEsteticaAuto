import { IsOptional, IsString } from 'class-validator';

// Body da rota PATCH /admin/orcamentos/:id/observacoes.
// Altera apenas as observações comerciais; não mexe em itens, status ou
// valores. negocioId no body (regra temporária sem autenticação).
// observacoes opcional: null/undefined limpa o campo (mesmo contrato da
// AtualizarObservacoesOrcamentoDTO da Application).
export class AtualizarObservacoesOrcamentoDto {
  @IsString()
  negocioId: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
