import { Cliente } from "../../../../Domain";

export class ClientePresenter {
  static toHTTP(cliente: Cliente) {
    return {
      id: cliente.id,
      negocioId: cliente.negocioId,
      nome: cliente.nome,
      tipo: cliente.tipo,
      documento: cliente.documento,
      telefone: cliente.telefone,
      email: cliente.email,
      status: cliente.status,
      criadoEm: cliente.criadoEm,
      atualizadoEm: cliente.atualizadoEm,
    };
  }

  // Aplica toHTTP em cada cliente da lista, devolvendo um array de respostas.
  static manyToHTTP(clientes: Cliente[]) {
    return clientes.map((cli) => this.toHTTP(cli));
  }
}
