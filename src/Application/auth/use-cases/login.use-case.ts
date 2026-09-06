import { Injectable } from "@nestjs/common";
import { UnauthorizedError } from "../../../Shared/errors/unauthorized.error";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { HashService } from "../services/hash.service";
import { TokenService } from "../services/token.service";
import { LoginInput } from "../dtos/login.input";
import { LoginOutput } from "../dtos/login.output";
import { UsuariosRepository } from "../../usuarios/repositories/usuarios.repository";

// Use Case de Login: autentica o usuário por identificador (usuario ou email) e senha,
// validando a senha com HashService (bcrypt) e gerando o JWT via TokenService.
@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usuariosRepository: UsuariosRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const identificador = (input.username || input.usuario)?.trim();
    const senha = input.senha || input.password;

    if (!identificador || !senha) {
      throw new ValidationError("Usuário e senha são obrigatórios.");
    }

    const usuario = await this.usuariosRepository.buscarPorIdentificador(identificador);
    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedError("Credenciais inválidas.");
    }

    if (!usuario.senhaHash) {
      throw new UnauthorizedError("Usuário sem credencial de senha configurada.");
    }

    const senhaValida = await this.hashService.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedError("Credenciais inválidas.");
    }

    const nomeUsuario = usuario.username || (usuario.email.includes("@")
      ? usuario.email.split("@")[0]
      : usuario.email);

    const papelUsuario = usuario.role || "ADMIN";

    const payload = {
      sub: usuario.id,
      username: nomeUsuario,
      role: papelUsuario,
      negocioId: usuario.negocioId,
      nome: usuario.nome,
      email: usuario.email,
      papel: papelUsuario,
    };

    const accessToken = await this.tokenService.gerarToken(payload);

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        negocioId: usuario.negocioId,
        nome: usuario.nome,
        username: nomeUsuario,
        usuario: nomeUsuario,
        email: usuario.email,
        role: papelUsuario,
        papel: papelUsuario,
      },
    };
  }
}
