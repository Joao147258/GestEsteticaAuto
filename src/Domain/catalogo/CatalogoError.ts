// Erro base do domínio de catálogo.
export class CatalogoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogoError";
  }
}
