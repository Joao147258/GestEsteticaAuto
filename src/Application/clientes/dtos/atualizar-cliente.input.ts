export type AtualizarClienteInput = {
    negocioId: string;
    clienteId: string;
    nome?: string;
    documento?: string | null;
    telefone?: string | null;
    email?: string | null;
};
