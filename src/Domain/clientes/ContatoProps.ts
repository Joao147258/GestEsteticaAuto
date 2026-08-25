import { TipoContatoCliente } from "./tipo_contato_cliente_types";

// Propriedades da entidade Contato.
// Cada contato representa UMA forma de contato (tipo + valor).
// Ex.: { tipo: "WHATSAPP", valor: "(45) 99999-9999", principal: true }.
export interface ContatoProps {
  id: string;
  clienteId: string;
  nome?: string | null;
  tipo: TipoContatoCliente;
  valor: string;
  principal: boolean;
  observacoes?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo Contato.
export interface CriarContatoProps {
  clienteId: string;
  nome?: string | null;
  tipo: TipoContatoCliente;
  valor: string;
  principal?: boolean;
  observacoes?: string | null;
}
