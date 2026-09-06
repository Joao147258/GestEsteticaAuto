import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenService } from '../../../Application/auth/services/token.service';
import { UnauthorizedError } from '../../../Shared/errors/unauthorized.error';

describe('JwtAuthGuard', () => {
  let reflector: jest.Mocked<Reflector>;
  let tokenService: jest.Mocked<TokenService>;
  let guard: JwtAuthGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    tokenService = {
      gerarToken: jest.fn(),
      verificarToken: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;

    guard = new JwtAuthGuard(reflector, tokenService);
  });

  function criarMockContext(request: any): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: jest.fn(),
      }),
    } as unknown as ExecutionContext;
  }

  it('permite acesso direto quando rota for anotada com @Public()', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const ctx = criarMockContext({ headers: {} });

    const canActivate = await guard.canActivate(ctx);
    expect(canActivate).toBe(true);
  });

  it('lança UnauthorizedError quando cabeçalho Authorization estiver ausente em rota protegida como /auth/me', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const ctx = criarMockContext({ url: '/auth/me', headers: {}, query: {}, body: {} });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedError);
  });

  it('lança UnauthorizedError quando o token não iniciar com Bearer', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const ctx = criarMockContext({
      headers: { authorization: 'Basic 123456' },
      query: {},
      body: {},
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedError);
  });

  it('autentica com sucesso e preenche request.user quando o token for válido', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    tokenService.verificarToken.mockResolvedValue({
      sub: 'usr-10',
      negocioId: 'gestcorp-auto-demo',
      nome: 'João Dantas',
      email: 'joao.dantas@gestcorp.com.br',
      username: 'joao.dantas',
      role: 'ADMIN',
      papel: 'ADMIN',
    });

    const req: any = {
      headers: { authorization: 'Bearer token.jwt.valido' },
    };
    const ctx = criarMockContext(req);

    const canActivate = await guard.canActivate(ctx);

    expect(canActivate).toBe(true);
    expect(req.user).toEqual({
      id: 'usr-10',
      negocioId: 'gestcorp-auto-demo',
      nome: 'João Dantas',
      email: 'joao.dantas@gestcorp.com.br',
      username: 'joao.dantas',
      usuario: 'joao.dantas',
      role: 'ADMIN',
      papel: 'ADMIN',
    });
  });

  it('rejeita com UnauthorizedError rota protegida /admin sem token mesmo com negocioId', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const req: any = {
      url: '/admin/orcamentos',
      headers: {},
      query: { negocioId: 'tenant-demo' },
      body: {},
    };
    const ctx = criarMockContext(req);

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedError);
  });

  it('rejeita com UnauthorizedError quando token for inválido ou expirado', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    tokenService.verificarToken.mockRejectedValue(
      new UnauthorizedError('Token de autenticação inválido ou expirado.'),
    );
    const req: any = {
      url: '/admin/clientes',
      headers: { authorization: 'Bearer token.invalido' },
    };
    const ctx = criarMockContext(req);

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedError);
  });
});
