-- AlterTable
ALTER TABLE "Servico" ADD COLUMN     "observacoes" TEXT;

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "custoReferencia" DECIMAL(10,2),
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "precoVendaSugerido" DECIMAL(10,2),
ADD COLUMN     "tipoUso" TEXT NOT NULL DEFAULT 'INSUMO_INTERNO',
ADD COLUMN     "unidadeMedida" TEXT NOT NULL DEFAULT 'UNIDADE';

-- CreateTable
CREATE TABLE "ConsumoInsumoServico" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "unidadeMedida" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsumoInsumoServico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsumoInsumoServico_negocioId_idx" ON "ConsumoInsumoServico"("negocioId");

-- CreateIndex
CREATE INDEX "ConsumoInsumoServico_servicoId_idx" ON "ConsumoInsumoServico"("servicoId");

-- CreateIndex
CREATE INDEX "ConsumoInsumoServico_produtoId_idx" ON "ConsumoInsumoServico"("produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumoInsumoServico_negocioId_servicoId_produtoId_key" ON "ConsumoInsumoServico"("negocioId", "servicoId", "produtoId");

-- AddForeignKey
ALTER TABLE "ConsumoInsumoServico" ADD CONSTRAINT "ConsumoInsumoServico_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoInsumoServico" ADD CONSTRAINT "ConsumoInsumoServico_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoInsumoServico" ADD CONSTRAINT "ConsumoInsumoServico_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

