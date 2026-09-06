import { IsNotEmpty, IsString } from 'class-validator';

// ConsultarConsumoPrevistoQueryDto — valida os query parameters para cálculo de consumo previsto da OS.
// Garante que o negocioId seja fornecido para buscar a OS e as fichas técnicas corretas do tenant.
export class ConsultarConsumoPrevistoQueryDto {
  @IsString()
  @IsNotEmpty({ message: 'negocioId é obrigatório para consultar o consumo previsto' })
  negocioId: string;
}
