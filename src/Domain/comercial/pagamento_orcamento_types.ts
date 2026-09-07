export type FormaPagamentoPrevista =
  | "DINHEIRO"
  | "PIX"
  | "CARTAO_DEBITO"
  | "CARTAO_CREDITO"
  | "TRANSFERENCIA"
  | "BOLETO"
  | "OUTRO";

export type CondicaoPagamento =
  | "A_VISTA"
  | "NA_ENTREGA"
  | "PARCELADO"
  | "SINAL_E_RESTANTE_NA_ENTREGA"
  | "OUTRO";

export const FORMAS_PAGAMENTO_LABELS: Record<string, string> = {
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  CARTAO_DEBITO: "Cartão de Débito",
  CARTAO_CREDITO: "Cartão de Crédito",
  TRANSFERENCIA: "Transferência",
  BOLETO: "Boleto",
  OUTRO: "Outro",
};

export const CONDICOES_PAGAMENTO_LABELS: Record<string, string> = {
  A_VISTA: "À vista",
  NA_ENTREGA: "Na entrega",
  PARCELADO: "Parcelado",
  SINAL_E_RESTANTE_NA_ENTREGA: "Sinal + restante na entrega",
  OUTRO: "Outro",
};
