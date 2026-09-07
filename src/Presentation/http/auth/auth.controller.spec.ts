import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsuarioAutenticado } from '../../../Shared/types/usuario-autenticado.type';

describe('AuthController', () => {
  let authService: jest.Mocked<AuthService>;
  let controller: AuthController;

  beforeEach(() => {
    authService = {
      login: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    controller = new AuthController(authService);
  });

  it('POST /auth/login retorna accessToken e informações do usuário formatadas', async () => {
    authService.login.mockResolvedValue({
      accessToken: 'jwt.token.teste',
      usuario: {
        id: 'usr-1',
        negocioId: 'gestcorp-auto-demo',
        nome: 'João Dantas',
        usuario: 'joao.dantas',
        username: 'joao.dantas',
        email: 'joao.dantas@gestcorp.com.br',
        papel: 'ADMIN',
        role: 'ADMIN',
      },
    });

    const body = Object.assign(new LoginDto(), {
      usuario: 'joao.dantas',
      senha: 'SecretPassword123',
    });

    const response = await controller.login(body);

    expect(authService.login).toHaveBeenCalledWith(body);
    expect(response).toEqual({
      accessToken: 'jwt.token.teste',
      usuario: {
        id: 'usr-1',
        nome: 'João Dantas',
        username: 'joao.dantas',
        usuario: 'joao.dantas',
        role: 'ADMIN',
        papel: 'ADMIN',
        negocioId: 'gestcorp-auto-demo',
      },
    });
  });

  it('GET /auth/me devolve o usuário autenticado da requisição', async () => {
    const user: UsuarioAutenticado = {
      id: 'usr-1',
      negocioId: 'gestcorp-auto-demo',
      nome: 'João Dantas',
      usuario: 'joao.dantas',
      email: 'joao.dantas@gestcorp.com.br',
      papel: 'ADMIN',
    };

    const response = await controller.me(user);

    expect(response).toEqual({
      id: 'usr-1',
      nome: 'João Dantas',
      username: 'joao.dantas',
      usuario: 'joao.dantas',
      role: 'ADMIN',
      papel: 'ADMIN',
      negocioId: 'gestcorp-auto-demo',
    });
  });

  it('POST /auth/logout devolve mensagem de encerramento de sessão', async () => {
    const response = await controller.logout();

    expect(response).toEqual({
      message: 'Sessão encerrada com sucesso.',
    });
  });
});
