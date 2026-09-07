import { LoginUseCase } from "./login.use-case";
import { UsuariosRepository } from "../../usuarios/repositories/usuarios.repository";
import { HashService } from "../services/hash.service";
import { TokenService } from "../services/token.service";
import { Usuario } from "../../../Domain/negocio/usuario";
import { UnauthorizedError } from "../../../Shared/errors/unauthorized.error";
import { ValidationError } from "../../../Shared/errors/validation.error";

describe("LoginUseCase", () => {
  let usuariosRepository: jest.Mocked<UsuariosRepository>;
  let hashService: jest.Mocked<HashService>;
  let tokenService: jest.Mocked<TokenService>;
  let useCase: LoginUseCase;

  const usuarioMock = Usuario.reconstituir({
    id: "usr-123",
    negocioId: "gestcorp-auto-demo",
    nome: "João Dantas",
    email: "joao.dantas@gestcorp.com.br",
    senhaHash: "$2a$10$hashedpassword",
    role: "ADMIN",
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  });

  beforeEach(() => {
    usuariosRepository = {
      salvar: jest.fn(),
      buscarPorId: jest.fn(),
      buscarPorEmail: jest.fn(),
      buscarPorIdentificador: jest.fn(),
      listarPorNegocio: jest.fn(),
    } as unknown as jest.Mocked<UsuariosRepository>;

    hashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as unknown as jest.Mocked<HashService>;

    tokenService = {
      gerarToken: jest.fn(),
      verificarToken: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;

    useCase = new LoginUseCase(usuariosRepository, hashService, tokenService);
  });

  it("autentica com sucesso e gera token JWT quando credenciais são válidas", async () => {
    usuariosRepository.buscarPorIdentificador.mockResolvedValue(usuarioMock);
    hashService.compare.mockResolvedValue(true);
    tokenService.gerarToken.mockResolvedValue("jwt.token.valido");

    const output = await useCase.execute({
      usuario: "joao.dantas",
      senha: "SenhaCorreta@123",
    });

    expect(usuariosRepository.buscarPorIdentificador).toHaveBeenCalledWith("joao.dantas");
    expect(hashService.compare).toHaveBeenCalledWith("SenhaCorreta@123", "$2a$10$hashedpassword");
    expect(tokenService.gerarToken).toHaveBeenCalledWith({
      sub: "usr-123",
      username: "joao.dantas",
      role: "ADMIN",
      negocioId: "gestcorp-auto-demo",
      nome: "João Dantas",
      email: "joao.dantas@gestcorp.com.br",
      papel: "ADMIN",
    });
    expect(output.accessToken).toBe("jwt.token.valido");
    expect(output.usuario.id).toBe("usr-123");
    expect(output.usuario.username).toBe("joao.dantas");
    expect(output.usuario.role).toBe("ADMIN");
    expect(output.usuario.usuario).toBe("joao.dantas");
    expect(output.usuario.papel).toBe("ADMIN");
    expect((output as any).senhaHash).toBeUndefined();
    expect((output.usuario as any).senhaHash).toBeUndefined();
  });

  it("JWT payload contém sub, username e role", async () => {
    usuariosRepository.buscarPorIdentificador.mockResolvedValue(usuarioMock);
    hashService.compare.mockResolvedValue(true);
    tokenService.gerarToken.mockResolvedValue("jwt.token.valido");

    await useCase.execute({
      username: "joao.dantas",
      password: "SenhaCorreta@123",
    });

    expect(tokenService.gerarToken).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: "usr-123",
        username: "joao.dantas",
        role: "ADMIN",
      }),
    );
  });

  it("lança ValidationError se identificador ou senha forem omitidos", async () => {
    await expect(useCase.execute({ usuario: "", senha: "123" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ usuario: "joao", senha: "" })).rejects.toThrow(ValidationError);
  });

  it("lança UnauthorizedError quando o usuário não for encontrado", async () => {
    usuariosRepository.buscarPorIdentificador.mockResolvedValue(null);

    await expect(
      useCase.execute({ usuario: "inexistente", senha: "123" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("lança UnauthorizedError quando o usuário estiver inativo", async () => {
    const usuarioInativo = Usuario.reconstituir({
      id: "usr-inativo",
      negocioId: "gestcorp-auto-demo",
      nome: "Inativo",
      email: "inativo@email.com",
      senhaHash: "$2a$10$xyz",
      role: "OPERADOR",
      ativo: false,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
    usuariosRepository.buscarPorIdentificador.mockResolvedValue(usuarioInativo);

    await expect(
      useCase.execute({ usuario: "inativo@email.com", senha: "123" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("lança UnauthorizedError quando a senha fornecida for incorreta", async () => {
    usuariosRepository.buscarPorIdentificador.mockResolvedValue(usuarioMock);
    hashService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ usuario: "joao.dantas", senha: "SenhaErrada" }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
