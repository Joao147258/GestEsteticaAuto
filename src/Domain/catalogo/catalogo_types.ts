// Tipos compartilhados do módulo catálogo.

// Registro de alteração importante no catálogo (histórico flexível).
export interface RegistroAlteracaoCatalogo {
  campo: string;
  valorAnterior: string | number | boolean | Date | null | undefined;
  valorNovo: string | number | boolean | Date | null | undefined;
  descricao?: string | null;
  alteradoPor?: string | null;
  alteradoEm: Date;
}

// Dados opcionais de quem/por que alterou.
export interface DadosAlteracaoCatalogo {
  alteradoPor?: string | null;
  descricao?: string | null;
}
