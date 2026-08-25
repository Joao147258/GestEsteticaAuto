// Propriedades da entidade AnexoCliente.
// Guarda metadados do arquivo — `url` é opcional porque futuramente o anexo
// pode ser referenciado por `anexoId` (módulo shared/anexo).
export interface AnexoClienteProps {
  id: string;
  clienteId: string;
  nome: string;
  url?: string | null;
  anexoId?: string | null;
  descricao?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo AnexoCliente.
export interface CriarAnexoClienteProps {
  clienteId: string;
  nome: string;
  url?: string | null;
  anexoId?: string | null;
  descricao?: string | null;
}
