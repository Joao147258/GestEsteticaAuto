import { randomUUID } from "crypto";
import { ClienteError } from "./ClienteError";
import {
  PreferenciaClienteProps,
  CriarPreferenciaClienteProps,
} from "./PreferenciaClienteProps";

// Preferência do cliente — formato chave/valor flexível.
// Ex.: { chave: "preferencia_contato", valor: "WHATSAPP" }.
// Decisão: chave/valor (em vez de campos fixos) permite novas preferências
// sem alterar o schema do domínio.
export class PreferenciaCliente {
  private constructor(private readonly props: PreferenciaClienteProps) {}

  // Obrigatórios: clienteId, chave e valor — sem chave/valor não há o que
  // registrar como preferência.
  static criar(props: CriarPreferenciaClienteProps): PreferenciaCliente {
    const clienteId = props.clienteId?.trim();
    if (!clienteId) {
      throw new ClienteError("Cliente é obrigatório");
    }
    const chave = props.chave?.trim();
    if (!chave) {
      throw new ClienteError("Chave da preferência é obrigatória");
    }
    const valor = props.valor?.trim();
    if (!valor) {
      throw new ClienteError("Valor da preferência é obrigatório");
    }

    const agora = new Date();

    return new PreferenciaCliente({
      id: randomUUID(),
      clienteId,
      chave,
      valor,
      observacoes: props.observacoes?.trim() || null,
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  alterarChave(chave: string): void {
    const chaveNormalizada = chave.trim();
    if (!chaveNormalizada) {
      throw new ClienteError("Chave da preferência é obrigatória");
    }
    this.props.chave = chaveNormalizada;
    this.props.atualizadoEm = new Date();
  }

  alterarValor(valor: string): void {
    const valorNormalizado = valor.trim();
    if (!valorNormalizado) {
      throw new ClienteError("Valor da preferência é obrigatório");
    }
    this.props.valor = valorNormalizado;
    this.props.atualizadoEm = new Date();
  }

  alterarObservacoes(observacoes: string | null): void {
    this.props.observacoes = observacoes?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): PreferenciaClienteProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get clienteId(): string {
    return this.props.clienteId;
  }

  get chave(): string {
    return this.props.chave;
  }

  get valor(): string {
    return this.props.valor;
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
