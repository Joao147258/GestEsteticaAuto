// Erro base do domínio de clientes.
// Um único erro por domínio nesta etapa — erros específicos virão depois.
export class ClienteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClienteError";
  }
}
