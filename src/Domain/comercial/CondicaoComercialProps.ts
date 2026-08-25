import {
  FormaPagamentoComercial,
  RegistroAlteracaoComercial,
  StatusCondicaoComercial,
  TipoDesconto,
} from "./comercial_types";

export interface CondicaoComercialProps {
  id: string;
  negocioId: string;

  // Referência opcional à política comercial usada como base.
  // A condição não herda a política; ela apenas pode ser validada por ela.
  politicaComercialId?: string | null;

  // Forma de pagamento escolhida para este orçamento/negociação.
  formaPagamento: FormaPagamentoComercial;

  // Quantidade de parcelas escolhida.
  // Exemplo: PIX normalmente 1, cartão pode ser 2, 3, 6 etc.
  quantidadeParcelas: number;

  // Desconto aplicado nesta condição específica.
  tipoDesconto?: TipoDesconto | null;
  valorDesconto?: number | null;

  // Valor de entrada/sinal combinado com o cliente.
  valorSinal?: number | null;

  // Taxa de maquininha aplicada nesta negociação.
  // A política define se pode ou não repassar; a condição registra o que foi aplicado.
  repassarTaxaMaquininha: boolean;
  taxaMaquininhaPercentual?: number | null;

  // Regras combinadas para atraso, caso façam parte da negociação.
  jurosAtrasoPercentualMes?: number | null;
  multaAtrasoPercentual?: number | null;

  // Validade desta condição comercial.
  validadeAte?: Date | null;

  // Observações comerciais específicas do orçamento.
  observacao?: string | null;

  status: StatusCondicaoComercial;

  // Histórico de alterações importantes da condição.
  alteracoes: RegistroAlteracaoComercial[];

  criadoEm: Date;
  atualizadoEm: Date;
}

export interface CriarCondicaoComercialProps {
  negocioId: string;

  politicaComercialId?: string | null;

  formaPagamento: FormaPagamentoComercial;

  // Pode assumir 1 como padrão dentro do método criar().
  quantidadeParcelas?: number;

  tipoDesconto?: TipoDesconto | null;
  valorDesconto?: number | null;

  valorSinal?: number | null;

  // Pode assumir false como padrão dentro do método criar().
  repassarTaxaMaquininha?: boolean;
  taxaMaquininhaPercentual?: number | null;

  jurosAtrasoPercentualMes?: number | null;
  multaAtrasoPercentual?: number | null;

  validadeAte?: Date | null;

  observacao?: string | null;
}