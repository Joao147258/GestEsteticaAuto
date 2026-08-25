// Erro base do domínio de negócio (tenant).
export class NegocioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NegocioError";
  }
}
