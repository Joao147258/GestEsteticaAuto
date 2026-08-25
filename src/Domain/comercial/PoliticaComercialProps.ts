import {
  FormaPagamentoComercial,
  RegistroAlteracaoComercial,
  StatusPoliticaComercial,
} from "./comercial_types";

export interface RegraFormaPagamento {
  // Forma de pagamento controlada por esta regra.
  forma: FormaPagamentoComercial;

  // Define se essa forma de pagamento está disponível para uso.
  ativa: boolean;

  // Define se essa forma permite parcelamento.
  permiteParcelamento: boolean;

  // Limite máximo de parcelas para essa forma.
  // Para PIX, dinheiro ou débito, normalmente será 1.
  quantidadeMaximaParcelas: number;

  // Desconto automático ou permitido para pagamento à vista.
  descontoAVistaPercentual?: number | null;

  // Define se a taxa da maquininha pode ser repassada ao cliente.
  repassarTaxaMaquininha: boolean;

  // Percentual da taxa de maquininha para essa forma.
  // Exemplo: cartão de crédito 3.5%.
  taxaMaquininhaPercentual?: number | null;

  // Define se essa forma exige sinal/entrada.
  exigeSinal: boolean;

  // Percentual mínimo de sinal exigido.
  // Exemplo: 30 significa 30% do valor total.
  percentualMinimoSinal?: number | null;
}

export interface PoliticaComercialProps {
  id: string;
  negocioId: string;

  nome: string;
  descricao?: string | null;

  // Limite geral de desconto permitido em percentual.
  descontoMaximoPercentual: number;

  // Limite geral de desconto permitido em valor absoluto.
  // Pode ser usado futuramente para bloquear descontos acima de certo valor.
  descontoMaximoValor?: number | null;

  // Prazo padrão de validade dos orçamentos, em dias.
  prazoValidadeDias: number;

  // Regras específicas por forma de pagamento.
  formasPagamento: RegraFormaPagamento[];

  // Regras comerciais para atraso, quando informadas na negociação.
  jurosAtrasoPercentualMes?: number | null;
  multaAtrasoPercentual?: number | null;

  // Permite que uma condição seja negociada manualmente fora do padrão.
  permiteNegociacaoManual: boolean;

  // Define se descontos acima do limite exigem aprovação especial.
  exigeAprovacaoAcimaDoDescontoMaximo: boolean;

  status: StatusPoliticaComercial;

  // Histórico de alterações importantes da política.
  alteracoes: RegistroAlteracaoComercial[];

  criadoEm: Date;
  atualizadoEm: Date;
}

export interface CriarPoliticaComercialProps {
  negocioId: string;

  nome: string;
  descricao?: string | null;

  descontoMaximoPercentual: number;
  descontoMaximoValor?: number | null;

  prazoValidadeDias: number;

  formasPagamento: RegraFormaPagamento[];

  jurosAtrasoPercentualMes?: number | null;
  multaAtrasoPercentual?: number | null;

  // Pode assumir false como padrão dentro do método criar().
  permiteNegociacaoManual?: boolean;

  // Pode assumir true como padrão dentro do método criar().
  exigeAprovacaoAcimaDoDescontoMaximo?: boolean;
}