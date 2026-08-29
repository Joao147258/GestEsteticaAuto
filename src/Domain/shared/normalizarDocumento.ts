// Normaliza documento removendo tudo que não for dígito.
// Não valida CPF/CNPJ, dígitos verificadores ou tamanho neste momento.
export function normalizarDocumento(documento: string): string {
  return documento.replace(/\D/g, "");
}
