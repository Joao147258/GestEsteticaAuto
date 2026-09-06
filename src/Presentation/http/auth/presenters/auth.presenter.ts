import { LoginOutput } from '../../../../Application/auth/dtos/login.output';
import { UsuarioAutenticado } from '../../../../Shared/types/usuario-autenticado.type';

// AuthPresenter — serializa a resposta HTTP das operações de autenticação.
// Garante que senhas ou hashes nunca sejam expostos e padroniza a resposta para o frontend.
export class AuthPresenter {
  static toLoginHTTP(output: LoginOutput) {
    return {
      accessToken: output.accessToken,
      usuario: {
        id: output.usuario.id,
        nome: output.usuario.nome,
        usuario: output.usuario.usuario,
        papel: output.usuario.papel,
        negocioId: output.usuario.negocioId,
      },
    };
  }

  static toMeHTTP(user: UsuarioAutenticado) {
    return {
      id: user.id,
      nome: user.nome,
      usuario: user.usuario,
      papel: user.papel,
      negocioId: user.negocioId,
    };
  }
}
