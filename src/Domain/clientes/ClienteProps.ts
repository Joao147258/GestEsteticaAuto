import { ContatoProps } from "./ContatoProps";
import { EnderecoProps } from "./EnderecoProps";
import { PreferenciaClienteProps } from "./PreferenciaClienteProps";
import { TagClienteProps } from "./TagClienteProps";
import { AnexoClienteProps } from "./AnexoClienteProps";
import { TipoCliente } from "./tipo_cliente_types";
import { StatusCliente } from "./status_cliente_types";

// Registro de alteração cadastral do cliente (histórico flexível:
// aceita texto, número, booleano, data, descrição e autor).
export interface RegistroAlteracaoCliente {
  campo: string;
  valorAnterior: string | number | boolean | Date | null | undefined;
  valorNovo: string | number | boolean | Date | null | undefined;
  descricao?: string | null;
  alteradoPor?: string | null;
  alteradoEm: Date;
}

// Propriedades da entidade Cliente — apenas dados do domínio.
// Referências a Negocio e OrigemCliente são por id (não há composição).
export interface ClienteProps {
  id: string;
  negocioId: string;
  nome: string;
  tipo: TipoCliente;
  documento?: string | null;
  email?: string | null;
  telefone?: string | null;
  status: StatusCliente;
  observacoes?: string | null;
  origemId?: string | null;
  contatos: ContatoProps[];
  enderecos: EnderecoProps[];
  preferencias: PreferenciaClienteProps[];
  tags: TagClienteProps[];
  anexos: AnexoClienteProps[];
  alteracoes: RegistroAlteracaoCliente[];
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo Cliente.
export interface CriarClienteProps {
  negocioId: string;
  nome: string;
  tipo: TipoCliente;
  telefone?: string | null;
  documento?: string | null;
  email?: string | null;
  observacoes?: string | null;
  origemId?: string | null;
}
