// Erro base do domínio.
// Classe simples para erros de domínio puro (sem infraestrutura).
// Módulos específicos podem estender este erro ou manter os seus próprios.
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}
