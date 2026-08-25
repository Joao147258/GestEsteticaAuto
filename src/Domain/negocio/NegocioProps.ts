// Propriedades da entidade Negocio — o tenant do SaaS.
export interface NegocioProps {
  id: string;
  nome: string;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo Negocio.
export interface CriarNegocioProps {
  nome: string;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
}
