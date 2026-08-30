-- CreateEnum
CREATE TYPE "TipoParcela" AS ENUM ('SINAL', 'PARCELA');

-- DropForeignKey
ALTER TABLE "Titulo" DROP CONSTRAINT "Titulo_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Titulo" DROP CONSTRAINT "Titulo_orcamentoId_fkey";

-- DropForeignKey
ALTER TABLE "Titulo" DROP CONSTRAINT "Titulo_ordemServicoId_fkey";

-- DropForeignKey
ALTER TABLE "Pagamento" DROP CONSTRAINT "Pagamento_formaPagamentoId_fkey";

-- DropForeignKey
ALTER TABLE "Sinal" DROP CONSTRAINT "Sinal_negocioId_fkey";

-- DropForeignKey
ALTER TABLE "Sinal" DROP CONSTRAINT "Sinal_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Estoque" DROP CONSTRAINT "Estoque_negocioId_fkey";

-- DropForeignKey
ALTER TABLE "Estoque" DROP CONSTRAINT "Estoque_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "MovimentacaoEstoque" DROP CONSTRAINT "MovimentacaoEstoque_estoqueId_fkey";

-- DropForeignKey
ALTER TABLE "ReservaProduto" DROP CONSTRAINT "ReservaProduto_estoqueId_fkey";

-- DropForeignKey
ALTER TABLE "ReservaProduto" DROP CONSTRAINT "ReservaProduto_ordemServicoId_fkey";

-- AlterTable
ALTER TABLE "FormaPagamento" ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "exigeConfirmacaoManual" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Titulo" DROP COLUMN "orcamentoId",
DROP COLUMN "ordemServicoId",
DROP COLUMN "valorTotal",
ADD COLUMN     "canceladoEm" TIMESTAMP(3),
ADD COLUMN     "fornecedorId" TEXT,
ADD COLUMN     "motivoCancelamento" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "origem" TEXT NOT NULL,
ADD COLUMN     "origemId" TEXT,
ADD COLUMN     "valorAcrescimo" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "valorDesconto" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "valorOriginal" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "clienteId" DROP NOT NULL,
ALTER COLUMN "descricao" SET NOT NULL;

-- AlterTable
ALTER TABLE "Parcela" DROP COLUMN "dataPagamento",
DROP COLUMN "valor",
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "tipo" "TipoParcela" NOT NULL DEFAULT 'PARCELA',
ADD COLUMN     "valorOriginal" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN     "canceladoEm" TIMESTAMP(3),
ADD COLUMN     "confirmadoEm" TIMESTAMP(3),
ADD COLUMN     "formaPagamentoDescricao" TEXT NOT NULL,
ADD COLUMN     "motivoCancelamento" TEXT,
ALTER COLUMN "tituloId" SET NOT NULL,
ALTER COLUMN "parcelaId" SET NOT NULL,
ALTER COLUMN "formaPagamentoId" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDENTE';

-- DropTable
DROP TABLE "Sinal";

-- DropTable
DROP TABLE "Estoque";

-- DropTable
DROP TABLE "MovimentacaoEstoque";

-- DropTable
DROP TABLE "ReservaProduto";

-- DropEnum
DROP TYPE "TipoMovimentacaoEstoque";

-- CreateTable
CREATE TABLE "TituloAlteracaoHistorico" (
    "id" TEXT NOT NULL,
    "tituloId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "autorId" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TituloAlteracaoHistorico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstoqueVenda" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidadeAtual" INTEGER NOT NULL DEFAULT 0,
    "quantidadeReservada" INTEGER NOT NULL DEFAULT 0,
    "unidadeMedida" TEXT NOT NULL DEFAULT 'UNIDADE',
    "custoUnitario" DECIMAL(10,2),
    "precoVenda" DECIMAL(10,2),
    "estoqueMinimo" INTEGER,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstoqueVenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentacaoEstoqueVenda" (
    "id" TEXT NOT NULL,
    "estoqueVendaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "unidadeMedida" TEXT NOT NULL,
    "quantidadeAnterior" INTEGER NOT NULL,
    "quantidadeNova" INTEGER NOT NULL,
    "quantidadeReservadaAnterior" INTEGER,
    "quantidadeReservadaNova" INTEGER,
    "motivo" TEXT,
    "referenciaId" TEXT,
    "referenciaTipo" TEXT,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentacaoEstoqueVenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservaEstoqueVenda" (
    "id" TEXT NOT NULL,
    "estoqueVendaId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "unidadeMedida" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVA',
    "referenciaId" TEXT,
    "referenciaTipo" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservaEstoqueVenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstoqueInterno" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidadeAtual" INTEGER NOT NULL DEFAULT 0,
    "unidadeMedida" TEXT NOT NULL DEFAULT 'UNIDADE',
    "custoUnitarioAproximado" DECIMAL(10,2),
    "estoqueMinimo" INTEGER,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstoqueInterno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentacaoEstoqueInterno" (
    "id" TEXT NOT NULL,
    "estoqueInternoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "unidadeMedida" TEXT NOT NULL,
    "quantidadeAnterior" INTEGER NOT NULL,
    "quantidadeNova" INTEGER NOT NULL,
    "motivo" TEXT,
    "observacoes" TEXT,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentacaoEstoqueInterno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TituloAlteracaoHistorico_tituloId_idx" ON "TituloAlteracaoHistorico"("tituloId");

-- CreateIndex
CREATE INDEX "TituloAlteracaoHistorico_tipo_idx" ON "TituloAlteracaoHistorico"("tipo");

-- CreateIndex
CREATE INDEX "EstoqueVenda_negocioId_idx" ON "EstoqueVenda"("negocioId");

-- CreateIndex
CREATE UNIQUE INDEX "EstoqueVenda_produtoId_key" ON "EstoqueVenda"("produtoId");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoqueVenda_estoqueVendaId_idx" ON "MovimentacaoEstoqueVenda"("estoqueVendaId");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoqueVenda_registradoEm_idx" ON "MovimentacaoEstoqueVenda"("registradoEm");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoqueVenda_referenciaId_referenciaTipo_idx" ON "MovimentacaoEstoqueVenda"("referenciaId", "referenciaTipo");

-- CreateIndex
CREATE INDEX "ReservaEstoqueVenda_estoqueVendaId_idx" ON "ReservaEstoqueVenda"("estoqueVendaId");

-- CreateIndex
CREATE INDEX "ReservaEstoqueVenda_referenciaId_referenciaTipo_idx" ON "ReservaEstoqueVenda"("referenciaId", "referenciaTipo");

-- CreateIndex
CREATE INDEX "EstoqueInterno_negocioId_idx" ON "EstoqueInterno"("negocioId");

-- CreateIndex
CREATE UNIQUE INDEX "EstoqueInterno_produtoId_key" ON "EstoqueInterno"("produtoId");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoqueInterno_estoqueInternoId_idx" ON "MovimentacaoEstoqueInterno"("estoqueInternoId");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoqueInterno_registradoEm_idx" ON "MovimentacaoEstoqueInterno"("registradoEm");

-- CreateIndex
CREATE INDEX "Titulo_origem_origemId_idx" ON "Titulo"("origem", "origemId");

-- AddForeignKey
ALTER TABLE "Titulo" ADD CONSTRAINT "Titulo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "FormaPagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TituloAlteracaoHistorico" ADD CONSTRAINT "TituloAlteracaoHistorico_tituloId_fkey" FOREIGN KEY ("tituloId") REFERENCES "Titulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueVenda" ADD CONSTRAINT "EstoqueVenda_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueVenda" ADD CONSTRAINT "EstoqueVenda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoqueVenda" ADD CONSTRAINT "MovimentacaoEstoqueVenda_estoqueVendaId_fkey" FOREIGN KEY ("estoqueVendaId") REFERENCES "EstoqueVenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaEstoqueVenda" ADD CONSTRAINT "ReservaEstoqueVenda_estoqueVendaId_fkey" FOREIGN KEY ("estoqueVendaId") REFERENCES "EstoqueVenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueInterno" ADD CONSTRAINT "EstoqueInterno_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueInterno" ADD CONSTRAINT "EstoqueInterno_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoqueInterno" ADD CONSTRAINT "MovimentacaoEstoqueInterno_estoqueInternoId_fkey" FOREIGN KEY ("estoqueInternoId") REFERENCES "EstoqueInterno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

