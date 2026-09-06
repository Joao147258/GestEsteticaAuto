import { Injectable } from '@nestjs/common';
import { LoginUseCase } from '../../../Application/auth/use-cases/login.use-case';
import { LoginDto } from './dto/login.dto';

// AuthService — camada intermediária entre o controller de autenticação e os use cases da Application.
@Injectable()
export class AuthService {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  async login(dto: LoginDto) {
    return this.loginUseCase.execute({
      usuario: dto.usuario,
      senha: dto.senha,
    });
  }
}
