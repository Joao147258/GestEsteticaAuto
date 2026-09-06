import { LoginOutput } from '../../../../Application/auth/dtos/login.output';
import { UsuarioAutenticado } from '../../../../Shared/types/usuario-autenticado.type';

// AuthPresenter — serializa a resposta HTTP das operações de autenticação.
// Garante que senhas ou hashes nunca sejam expostos e padroniza a resposta para o frontend.
export class AuthPresenter {
  static toLoginHTTP(output: LoginOutput) {
    const username = output.usuario.username || output.usuario.usuario;
    const role = output.usuario.role || output.usuario.papel || 'ADMIN';
    return {
      accessToken: output.accessToken,
      usuario: {
        id: output.usuario.id,
        nome: output.usuario.nome,
        username,
        usuario: username,
        role,
        papel: role,
        negocioId: output.usuario.negocioId,
      },
    };
  }

  static toMeHTTP(user: UsuarioAutenticado) {
    const username = user.username || user.usuario;
    const role = user.role || user.papel || 'ADMIN';
    return {
      id: user.id,
      nome: user.nome,
      username,
      usuario: username,
      role,
      papel: role,
      negocioId: user.negocioId,
    };
  }
}
