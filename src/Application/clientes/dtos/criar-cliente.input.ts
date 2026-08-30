import type { TipoCliente } from "../../../Domain";

// Dados que o CriarClienteUseCase precisa para criar um cliente.
// tipo é obrigatório porque o domínio exige TipoCliente na criação.
export type CriarClienteInput = {
  negocioId: string;
  nome: string;
  tipo: TipoCliente;
  documento?: string | null; // futura melhoria para tratar CPF ou CNPJ
  telefone?: string | null;
  email?: string | null;
};
