// Utilitário compartilhado pelos scripts de depuração do domínio.

// Imprime um rótulo seguido do valor, com profundidade total para inspeção.
export function mostrar(rotulo: string, valor: unknown): void {
  console.log(`\n--- ${rotulo} ---`);
  console.dir(valor, { depth: null });
}
