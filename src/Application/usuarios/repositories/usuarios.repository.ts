import { Usuario } from "../../../Domain/negocio/usuario";

// Contrato de persistência de usuários do sistema.
// Permite busca por identificador único (id), email ou identificador textual (username/email).
export abstract class UsuariosRepository {
  abstract salvar(usuario: Usuario): Promise<void>;
  abstract buscarPorId(id: string): Promise<Usuario | null>;
  abstract buscarPorEmail(negocioId: string, email: string): Promise<Usuario | null>;
  abstract buscarPorIdentificador(identificador: string): Promise<Usuario | null>;
  abstract listarPorNegocio(negocioId: string): Promise<Usuario[]>;
}
