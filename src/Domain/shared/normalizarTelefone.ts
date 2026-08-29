// Normaliza telefone removendo tudo que não for dígito.
// Não valida DDD, país ou formato neste momento.
export function normalizarTelefone(telefone: string): string {
  return telefone.replace(/\D/g, "");
}
