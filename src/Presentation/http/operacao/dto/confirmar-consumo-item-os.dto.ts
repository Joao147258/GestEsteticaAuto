import { IsNotEmpty, IsString } from 'class-validator';

// ConfirmarConsumoItemOsDto — valida o payload de confirmação de baixa de insumos da OS.
// O negocioId é obrigatório para garantir o isolamento multi-tenant do estoque no GestCorp Auto.
export class ConfirmarConsumoItemOsDto {
  @IsString()
  @IsNotEmpty({ message: 'negocioId é obrigatório para confirmar o consumo de insumos' })
  negocioId: string;
}
