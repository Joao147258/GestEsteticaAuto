import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// DTO HTTP da atualização de cliente (rota PATCH/PUT /clientes/:id).
// Todos os campos de dados são opcionais: o DTO só valida o que vier no body.
// negocioId é obrigatório para manter o escopo multi-tenant (a API nunca
// atualiza cliente sem escopo de negócio).
//
// O `tipo` NÃO está aqui de propósito: regra de negócio — o tipo é atribuído
// apenas na criação e nunca muda na edição (PF não vira PJ no mesmo cadastro).
// A Application (AtualizarClienteInput) já reflete essa regra; o DTO HTTP deve
// permanecer alinhado a ela.
export class AtualizarClienteDto {
  @IsString()
  @IsNotEmpty()
  negocioId: string;

  @IsOptional()
  @IsString()
  nome?: string;

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
