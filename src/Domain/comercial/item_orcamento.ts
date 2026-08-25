import { randomUUID } from "crypto";
import { ComercialError } from "./ComercialError";
import { ItemOrcamentoProps, CriarItemOrcamentoProps } from "./ItemOrcamentoProps";

// ItemOrcamento — uma linha do orçamento (serviço ou produto vendido).
// Guarda o snapshot da proposta: descrição e valores do momento da negociação.
export class ItemOrcamento {
  private constructor(private readonly props: ItemOrcamentoProps) {}

  // Obrigatórios: negocioId, orcamentoId, tipo e descrição. Decisões:
  // quantidade > 0; valor unitário e desconto não negativos; desconto do item
  // não pode superar o valor bruto; valorTotal é calculado na criação.
  static criar(props: CriarItemOrcamentoProps): ItemOrcamento {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new ComercialError("Negócio é obrigatório");
    }
    const orcamentoId = props.orcamentoId?.trim();
    if (!orcamentoId) {
      throw new ComercialError("Orçamento é obrigatório");
    }
    if (!props.tipo) {
      throw new ComercialError("Tipo do item é obrigatório");
    }
    const descricao = props.descricao?.trim();
    if (!descricao) {
      throw new ComercialError("Descrição do item é obrigatória");
    }
    if (props.quantidade <= 0) {
      throw new ComercialError("Quantidade deve ser maior que zero");
    }
    if (props.valorUnitario < 0) {
      throw new ComercialError("Valor unitário não pode ser negativo");
    }
    const valorDesconto = props.valorDesconto ?? 0;
    if (valorDesconto < 0) {
      throw new ComercialError("Desconto do item não pode ser negativo");
    }

    return new ItemOrcamento({
      id: randomUUID(),
      negocioId,
      orcamentoId,
      tipo: props.tipo,
      referenciaId: props.referenciaId?.trim() || null,
      descricao,
      quantidade: props.quantidade,
      valorUnitario: props.valorUnitario,
      valorDesconto,
      valorTotal: ItemOrcamento.calcularTotal(
        props.quantidade,
        props.valorUnitario,
        valorDesconto,
      ),
      observacoes: props.observacoes?.trim() || null,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  // Reconstitui a entidade a partir de dados já persistidos (sem revalidar).
  static reconstituir(props: ItemOrcamentoProps): ItemOrcamento {
    return new ItemOrcamento(props);
  }

  // Cálculo central da linha: bruto (qtd × unitário) menos o desconto.
  // A proteção "desconto > bruto" evita linha com total negativo.
  private static calcularTotal(
    quantidade: number,
    valorUnitario: number,
    valorDesconto: number,
  ): number {
    const bruto = quantidade * valorUnitario;
    if (valorDesconto > bruto) {
      throw new ComercialError("Desconto do item não pode ser maior que o valor bruto");
    }
    return bruto - valorDesconto;
  }

  // Alterações revalidam o valor e recalculam o total da linha (o orçamento
  // pai recalcula o próprio total ao receber o toProps() de volta).
  alterarQuantidade(quantidade: number): void {
    if (quantidade <= 0) {
      throw new ComercialError("Quantidade deve ser maior que zero");
    }
    this.props.quantidade = quantidade;
    this.recalcular();
  }

  alterarValorUnitario(valorUnitario: number): void {
    if (valorUnitario < 0) {
      throw new ComercialError("Valor unitário não pode ser negativo");
    }
    this.props.valorUnitario = valorUnitario;
    this.recalcular();
  }

  alterarDesconto(valorDesconto: number): void {
    if (valorDesconto < 0) {
      throw new ComercialError("Desconto do item não pode ser negativo");
    }
    this.props.valorDesconto = valorDesconto;
    this.recalcular();
  }

  private recalcular(): void {
    this.props.valorTotal = ItemOrcamento.calcularTotal(
      this.props.quantidade,
      this.props.valorUnitario,
      this.props.valorDesconto,
    );
    this.props.atualizadoEm = new Date();
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): ItemOrcamentoProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get orcamentoId(): string {
    return this.props.orcamentoId;
  }

  get tipo(): ItemOrcamentoProps["tipo"] {
    return this.props.tipo;
  }

  get referenciaId(): string | null | undefined {
    return this.props.referenciaId;
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get quantidade(): number {
    return this.props.quantidade;
  }

  get valorUnitario(): number {
    return this.props.valorUnitario;
  }

  get valorDesconto(): number {
    return this.props.valorDesconto;
  }

  get valorTotal(): number {
    return this.props.valorTotal;
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
