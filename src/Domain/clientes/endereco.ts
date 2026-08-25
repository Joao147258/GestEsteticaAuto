import { randomUUID } from "crypto";
import { ClienteError } from "./ClienteError";
import { EnderecoProps, CriarEnderecoProps } from "./EnderecoProps";

// Endereco de um cliente — pertence ao agregado Cliente.
// Cidade/estado são opcionais; o endereço só não pode ser totalmente vazio.
// Compõe o Cliente via lista enderecos[] (adicionarEndereco recebe toProps()).
export class Endereco {
  private constructor(private readonly props: EnderecoProps) {}

  // Decisão: cada campo é opcional individualmente, mas um endereço não pode
  // ser totalmente vazio (não haveria valor para persistir).
  static criar(props: CriarEnderecoProps): Endereco {
    const clienteId = props.clienteId?.trim();
    if (!clienteId) {
      throw new ClienteError("Cliente é obrigatório");
    }

    // Regra: não adicionar endereço totalmente vazio.
    const temAlgumCampo = [
      props.cep,
      props.logradouro,
      props.numero,
      props.complemento,
      props.bairro,
      props.cidade,
      props.estado,
      props.observacoes,
    ].some((valor) => valor && valor.trim());

    if (!temAlgumCampo) {
      throw new ClienteError("Endereço não pode ser totalmente vazio");
    }

    const agora = new Date();

    return new Endereco({
      id: randomUUID(),
      clienteId,
      cep: props.cep?.trim() || null,
      logradouro: props.logradouro?.trim() || null,
      numero: props.numero?.trim() || null,
      complemento: props.complemento?.trim() || null,
      bairro: props.bairro?.trim() || null,
      cidade: props.cidade?.trim() || null,
      estado: props.estado?.trim() || null,
      principal: props.principal ?? false,
      observacoes: props.observacoes?.trim() || null,
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  alterarCep(cep: string | null): void {
    this.props.cep = cep?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  alterarLogradouro(logradouro: string | null): void {
    this.props.logradouro = logradouro?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  alterarNumero(numero: string | null): void {
    this.props.numero = numero?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  alterarComplemento(complemento: string | null): void {
    this.props.complemento = complemento?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  alterarBairro(bairro: string | null): void {
    this.props.bairro = bairro?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  alterarCidade(cidade: string | null): void {
    this.props.cidade = cidade?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  alterarEstado(estado: string | null): void {
    this.props.estado = estado?.trim() || null;
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
  toProps(): EnderecoProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get clienteId(): string {
    return this.props.clienteId;
  }

  get cep(): string | null | undefined {
    return this.props.cep;
  }

  get logradouro(): string | null | undefined {
    return this.props.logradouro;
  }

  get numero(): string | null | undefined {
    return this.props.numero;
  }

  get complemento(): string | null | undefined {
    return this.props.complemento;
  }

  get bairro(): string | null | undefined {
    return this.props.bairro;
  }

  get cidade(): string | null | undefined {
    return this.props.cidade;
  }

  get estado(): string | null | undefined {
    return this.props.estado;
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
