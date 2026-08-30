-- AlterTable
ALTER TABLE "EstoqueInterno" ALTER COLUMN "quantidadeAtual" SET DEFAULT 0,
ALTER COLUMN "quantidadeAtual" SET DATA TYPE DECIMAL(10,3),
ALTER COLUMN "estoqueMinimo" SET DATA TYPE DECIMAL(10,3);

-- AlterTable
ALTER TABLE "MovimentacaoEstoqueInterno" ADD COLUMN     "negocioId" TEXT NOT NULL,
ADD COLUMN     "produtoId" TEXT NOT NULL,
ADD COLUMN     "referenciaId" TEXT,
ADD COLUMN     "referenciaItemId" TEXT,
ADD COLUMN     "referenciaTipo" TEXT,
ALTER COLUMN "quantidade" SET DATA TYPE DECIMAL(10,3),
ALTER COLUMN "quantidadeAnterior" SET DATA TYPE DECIMAL(10,3),
ALTER COLUMN "quantidadeNova" SET DATA TYPE DECIMAL(10,3);

-- CreateIndex
CREATE INDEX "MovimentacaoEstoqueInterno_negocioId_idx" ON "MovimentacaoEstoqueInterno"("negocioId");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoqueInterno_produtoId_idx" ON "MovimentacaoEstoqueInterno"("produtoId");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoqueInterno_referenciaTipo_referenciaId_idx" ON "MovimentacaoEstoqueInterno"("referenciaTipo", "referenciaId");

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoqueInterno" ADD CONSTRAINT "MovimentacaoEstoqueInterno_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoqueInterno" ADD CONSTRAINT "MovimentacaoEstoqueInterno_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

