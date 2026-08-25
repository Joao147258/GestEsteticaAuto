import { StatusProduto } from "./status_produto_types";
import { TipoUsoProduto } from "./tipo_uso_produto_types";
import { UnidadeMedida } from "./unidade_medida_types";
import { RegistroAlteracaoCatalogo } from "./catalogo_types";

// Propriedades da entidade Produto.
// O Produto representa o item cadastrado — quantidade fica nos módulos de estoque.
export interface ProdutoProps {
  id: string;
  negocioId: string;
  nome: string;
  descricao?: string | null;
  categoriaId?: string | null;
  tipoUso: TipoUsoProduto;
  unidadeMedida: UnidadeMedida;
  // custoReferencia = quanto o produto custa aproximadamente para o negócio.
  custoReferencia?: number | null;
  // precoVendaSugerido = preço sugerido caso o produto seja vendido ao cliente.
  precoVendaSugerido?: number | null;
  status: StatusProduto;
  observacoes?: string | null;
  alteracoes: RegistroAlteracaoCatalogo[];
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo Produto.
export interface CriarProdutoProps {
  negocioId: string;
  nome: string;
  descricao?: string | null;
  categoriaId?: string | null;
  tipoUso: TipoUsoProduto;
  unidadeMedida: UnidadeMedida;
  custoReferencia?: number | null;
  precoVendaSugerido?: number | null;
  observacoes?: string | null;
}
