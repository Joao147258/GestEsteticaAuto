// Propriedades da entidade Endereco.
// Cidade/estado são OPCIONAIS (cadastro parcial), mas o endereço não pode
// ser totalmente vazio — pelo menos um campo deve estar preenchido.
export interface EnderecoProps {
  id: string;
  clienteId: string;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  principal: boolean;
  observacoes?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo Endereco.
export interface CriarEnderecoProps {
  clienteId: string;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  principal?: boolean;
  observacoes?: string | null;
}
