export type ListarClientesInput = {
    negocioId: string;
    busca?: string; // busca geral de uma palavra chave
    pagina?: number; // a página a ser buscada
    limite?: number;// numero maximo de registros por página
};
