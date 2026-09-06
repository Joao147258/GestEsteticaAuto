import { IsNotEmpty, IsString } from 'class-validator';

// LoginDto — valida o payload de autenticação HTTP.
// O identificador pode ser o nome de usuário (ex: joao.dantas) ou email completo.
export class LoginDto {
  @IsString({ message: 'usuario deve ser uma string válida' })
  @IsNotEmpty({ message: 'usuario é obrigatório para autenticação' })
  usuario: string;

  @IsString({ message: 'senha deve ser uma string válida' })
  @IsNotEmpty({ message: 'senha é obrigatória para autenticação' })
  senha: string;
}
