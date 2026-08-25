// Erro base do domínio de operação.
export class OperacaoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OperacaoError";
  }
}
