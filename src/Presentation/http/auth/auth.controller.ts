import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthPresenter } from './presenters/auth.presenter';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { UsuarioAutenticado } from '../../../Shared/types/usuario-autenticado.type';

// AuthController — rotas públicas e autenticadas do subsistema de segurança da V1.
// POST /auth/login  -> Autentica usuário e retorna JWT
// GET  /auth/me     -> Retorna informações do usuário autenticado no token
// POST /auth/logout -> Encerra a sessão
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    const resultado = await this.authService.login(body);
    return AuthPresenter.toLoginHTTP(resultado);
  }

  @Get('me')
  async me(@CurrentUser() user: UsuarioAutenticado) {
    return AuthPresenter.toMeHTTP(user);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Sessão encerrada com sucesso.' };
  }
}
