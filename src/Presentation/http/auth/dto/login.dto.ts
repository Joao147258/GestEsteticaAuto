import { IsOptional, IsString } from 'class-validator';

// LoginDto — valida o payload de autenticação HTTP.
// Suporta tanto `username` quanto `usuario`, e `senha` ou `password`.
export class LoginDto {
  @IsOptional()
  @IsString({ message: 'username deve ser uma string válida' })
  username?: string;

  @IsOptional()
  @IsString({ message: 'usuario deve ser uma string válida' })
  usuario?: string;

  @IsOptional()
  @IsString({ message: 'senha deve ser uma string válida' })
  senha?: string;

  @IsOptional()
  @IsString({ message: 'password deve ser uma string válida' })
  password?: string;

  getIdentificador(): string {
    return (this.username || this.usuario || '').trim();
  }

  getSenha(): string {
    return (this.senha || this.password || '').trim();
  }
}
