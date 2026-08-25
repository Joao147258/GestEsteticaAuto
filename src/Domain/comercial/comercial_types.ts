export type StatusPoliticaComercial = "ATIVA" | "INATIVA";

export type StatusCondicaoComercial = "ATIVA" | "INATIVA";

export type FormaPagamentoComercial =
    | "DINHEIRO"
    | "PIX"
    | "CARTAO_DEBITO"
    | "CARTAO_CREDITO"
    | "BOLETO"
    | "TRANSFERENCIA";

export type TipoDesconto = "PERCENTUAL" | "VALOR";

export interface RegistroAlteracaoComercial {
    campo: string;
    valorAnterior: string;
    valorNovo: string;

    alteradoPor?: string | null;
    descricao?: string | null;

    alteradoEm: Date;
}
export interface DadosAlteracaoComercial {
    alteradoPor?: string | null;
    descricao?: string | null;
}