// Erro base do domínio de veículos.
export class VeiculoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VeiculoError";
  }
}
