// Erro base do domínio financeiro.
export class FinanceiroError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FinanceiroError";
  }
}
