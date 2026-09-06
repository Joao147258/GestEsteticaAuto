import { IsNotEmpty, IsString } from 'class-validator';

// TransicaoStatusOsDto — valida o payload de transições simples de status na OS (iniciar e entregar).
// O negocioId é mandatório para assegurar que a transição ocorra sob o tenant correto.
export class TransicaoStatusOsDto {
  @IsString({ message: 'negocioId deve ser uma string válida' })
  @IsNotEmpty({ message: 'negocioId é obrigatório para transicionar status da ordem de serviço' })
  negocioId: string;
}
