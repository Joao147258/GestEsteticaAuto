// Erro base do domínio comercial.
export class ComercialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComercialError";
  }
}
