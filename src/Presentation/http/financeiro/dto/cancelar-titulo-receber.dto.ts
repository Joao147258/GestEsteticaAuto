import { IsNotEmpty, IsString } from 'class-validator';

// CancelarTituloReceberDto — valida a requisição de cancelamento de um título financeiro em aberto.
// O motivo é estritamente obrigatório e fica registrado no histórico imutável do título para auditoria.
// Conversa com o endpoint POST /admin/financeiro/titulos/:id/cancelar.
export class CancelarTituloReceberDto {
  @IsString({ message: 'negocioId deve ser uma string válida' })
  @IsNotEmpty({ message: 'negocioId é obrigatório' })
  negocioId: string;

  @IsString({ message: 'motivo deve ser uma string' })
  @IsNotEmpty({ message: 'motivo é obrigatório para cancelar o título a receber' })
  motivo: string;
}
