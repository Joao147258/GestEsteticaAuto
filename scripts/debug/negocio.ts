// Depuração do módulo negócio (Negocio e Usuario).
import { Negocio } from "../../src/Domain/negocio/negocio";
import { Usuario } from "../../src/Domain/negocio/usuario";
import { mostrar } from "./_utils";

export function executarNegocio(): void {
  const negocio = Negocio.criar({
    nome: "  AutoLavagem JD  ",
    cnpj: " 12.345.678/0001-90 ",
    telefone: " (11) 4002-8922 ",
    email: " contato@autojd.com.br ",
  });

  mostrar("Negócio criado", {
    id: negocio.id,
    nome: negocio.nome,
    cnpj: negocio.cnpj,
    email: negocio.email,
    ativo: negocio.ativo,
  });

  negocio.alterarNome("AutoLavagem JD Premium");
  negocio.inativar();

  mostrar("Negócio após alterações", {
    nome: negocio.nome,
    ativo: negocio.ativo,
  });

  const usuario = Usuario.criar({
    negocioId: negocio.id,
    nome: "João Dantas",
    email: "joao@autojd.com.br",
  });

  mostrar("Usuário criado", {
    id: usuario.id,
    negocioId: usuario.negocioId,
    nome: usuario.nome,
    email: usuario.email,
    ativo: usuario.ativo,
  });
}
