// Depuração do módulo clientes (agregado Cliente).
import { Cliente } from "../../src/Domain/clientes/cliente";
import { Contato } from "../../src/Domain/clientes/contato";
import { Endereco } from "../../src/Domain/clientes/endereco";
import { PreferenciaCliente } from "../../src/Domain/clientes/preferencia_cliente";
import { mostrar } from "./_utils";

export function executarCliente(): void {
  // Criação do agregado
  const cliente = Cliente.criar({
    negocioId: "neg-123",
    nome: "  João da Silva  ",
    tipo: "PESSOA_FISICA",
    documento: "123.456.789-00",
    telefone: "  (11) 99999-0000 ",
    email: "  joao@email.com ",
    observacoes: "Cliente indicado pelo Google",
  });

  mostrar("Cliente criado", {
    id: cliente.id,
    negocioId: cliente.negocioId,
    nome: cliente.nome,
    tipo: cliente.tipo,
    documento: cliente.documento,
    telefone: cliente.telefone,
    email: cliente.email,
    status: cliente.status,
    atualizadoEm: cliente.atualizadoEm,
  });

  // Alterações de dados principais (com autor)
  cliente.atualizarNome("João Souza", "func-1");
  cliente.atualizarTelefone("(11) 98888-1111", "func-1");
  cliente.atualizarEmail("joao.souza@email.com", "func-1");

  // Composição: contato, endereço e preferência (entidades com toProps)
  const contato = Contato.criar({
    clienteId: cliente.id,
    nome: "João",
    tipo: "WHATSAPP",
    valor: "(11) 97777-2222",
    principal: true,
  });
  cliente.adicionarContato(contato.toProps());

  const endereco = Endereco.criar({
    clienteId: cliente.id,
    cidade: "São Paulo",
    estado: "SP",
    logradouro: "Rua das Flores",
    numero: "123",
  });
  cliente.adicionarEndereco(endereco.toProps());

  const preferencia = PreferenciaCliente.criar({
    clienteId: cliente.id,
    chave: "preferencia_contato",
    valor: "WHATSAPP",
  });
  cliente.adicionarPreferencia(preferencia.toProps());

  // Status
  cliente.inativar("func-1");
  cliente.inativar(); // no-op (já inativo)

  mostrar("Cliente após alterações", {
    nome: cliente.nome,
    telefone: cliente.telefone,
    email: cliente.email,
    status: cliente.status,
    contatos: cliente.contatos.map((c) => ({ tipo: c.tipo, valor: c.valor })),
    enderecos: cliente.enderecos.length,
    preferencias: cliente.preferencias.length,
    alteracoes: cliente.alteracoes.map((a) => ({
      campo: a.campo,
      valorAnterior: a.valorAnterior,
      valorNovo: a.valorNovo,
      alteradoPor: a.alteradoPor,
    })),
  });
}
