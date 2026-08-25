// Propriedades da entidade PreferenciaCliente.
// Formato chave/valor flexível (ex.: chave "preferencia_contato", valor "WHATSAPP").
export interface PreferenciaClienteProps {
  id: string;
  clienteId: string;
  chave: string;
  valor: string;
  observacoes?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar uma nova PreferenciaCliente.
export interface CriarPreferenciaClienteProps {
  clienteId: string;
  chave: string;
  valor: string;
  observacoes?: string | null;
}
