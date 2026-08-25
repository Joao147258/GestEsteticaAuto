import { randomUUID } from "crypto";
import { ClienteError } from "./ClienteError";
import { ContatoProps, CriarContatoProps } from "./ContatoProps";
import { TipoContatoCliente } from "./tipo_contato_cliente_types";

// Contato de um cliente — representa UMA forma de contato (tipo + valor).
// Ex.: { tipo: "WHATSAPP", valor: "(45) 99999-9999" }.
// Compõe o Cliente via lista contatos[] (adicionarContato recebe toProps()).
export class Contato {
  private constructor(private readonly props: ContatoProps) {}

  // Obrigatórios: clienteId, tipo e valor. Decisão: `principal` padrão false —
  // um contato principal é marcado explicitamente, nunca assumido.
  static criar(props: CriarContatoProps): Contato {
    const clienteId = props.clienteId?.trim();
    if (!clienteId) {
      throw new ClienteError("Cliente é obrigatório");
    }
    if (!props.tipo) {
      throw new ClienteError("Tipo do contato é obrigatório");
    }
    const valor = props.valor?.trim();
    if (!valor) {
      throw new ClienteError("Valor do contato é obrigatório");
    }

    const agora = new Date();

    return new Contato({
      id: randomUUID(),
      clienteId,
      nome: props.nome?.trim() || null,
      tipo: props.tipo,
      valor,
      principal: props.principal ?? false,
      observacoes: props.observacoes?.trim() || null,
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  alterarNome(nome: string | null): void {
    this.props.nome = nome?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  alterarTipo(tipo: TipoContatoCliente): void {
    if (!tipo) {
      throw new ClienteError("Tipo do contato é obrigatório");
    }
    this.props.tipo = tipo;
    this.props.atualizadoEm = new Date();
  }

  alterarValor(valor: string): void {
    const valorNormalizado = valor.trim();
    if (!valorNormalizado) {
      throw new ClienteError("Valor do contato é obrigatório");
    }
    this.props.valor = valorNormalizado;
    this.props.atualizadoEm = new Date();
  }

  alterarObservacoes(observacoes: string | null): void {
    this.props.observacoes = observacoes?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  definirComoPrincipal(): void {
    this.props.principal = true;
    this.props.atualizadoEm = new Date();
  }

  removerComoPrincipal(): void {
    this.props.principal = false;
    this.props.atualizadoEm = new Date();
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): ContatoProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get clienteId(): string {
    return this.props.clienteId;
  }

  get nome(): string | null | undefined {
    return this.props.nome;
  }

  get tipo(): TipoContatoCliente {
    return this.props.tipo;
  }

  get valor(): string {
    return this.props.valor;
  }

  get principal(): boolean {
    return this.props.principal;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
