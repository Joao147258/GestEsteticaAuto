// Entrada do RegistrarPagamentoUseCase: registra um recebimento (total ou
// parcial) em uma parcela do título. Adaptação ao domínio: o pagamento é
// registrado numa parcela específica (parcelaFinanceiraId) e a forma de
// pagamento é referenciada por id (entidade configurável do negócio) com um
// snapshot de descrição — não é um literal fixo.
export type RegistrarPagamentoInput = {
  negocioId: string;
  tituloId: string;
  parcelaFinanceiraId: string;

  valor: number;
  formaPagamentoId: string;
  formaPagamentoDescricao?: string;

  dataPagamento?: Date;
  observacao?: string;
};
