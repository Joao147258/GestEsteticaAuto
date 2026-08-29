// Normaliza texto removendo espaços nas extremidades.
// Não aplica slug, uppercase/lowercase automático ou remoção de acentos.
export function normalizarTexto(texto: string): string {
  return texto.trim();
}
