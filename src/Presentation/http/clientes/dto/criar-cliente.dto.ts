import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { TipoCliente } from '../../../../Domain';

// Valores de TipoCliente do Domain (union type sem valor runtime), validação
// via @IsIn — mesmo padrão do listar-orcamentos-query.dto.ts. Manter em
// sincronia com src/Domain/clientes/tipo_cliente_types.ts. Se o Domain ganhar
// um enum runtime, migrar para @IsEnum.
const TIPOS_CLIENTE_VALIDOS = ['PESSOA_FISICA', 'PESSOA_JURIDICA'] as const;

// DTO HTTP da criação de cliente (rota POST /clientes).
// Contém apenas os dados principais persistidos na V1: sem contatos,
// endereços, tags, preferências, anexos ou histórico (composição futura).
// O ValidationPipe global (whitelist + forbidNonWhitelisted) rejeita campos
// extras. Sem validação de CPF/CNPJ neste momento — decisão da V1.
export class CriarClienteDto {
  @IsString()
  @IsNotEmpty()
  negocioId: string;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsIn(TIPOS_CLIENTE_VALIDOS)
  tipo: TipoCliente;

  @IsOptional()
  @IsString()
  documento?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
