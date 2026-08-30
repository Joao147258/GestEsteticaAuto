-- AlterTable
ALTER TABLE "Orcamento" ADD COLUMN     "condicaoComercialId" TEXT,
ADD COLUMN     "politicaComercialId" TEXT,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "validoAte" TIMESTAMP(3),
ADD COLUMN     "valorAcrescimo" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "valorDesconto" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "valorTotal" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ItemOrcamento" ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "negocioId" TEXT NOT NULL,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'SERVICO',
ADD COLUMN     "valorTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ALTER COLUMN "quantidade" SET DEFAULT 1,
ALTER COLUMN "quantidade" SET DATA TYPE DECIMAL(10,3);

-- AlterTable
ALTER TABLE "AceiteOrcamento" ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "canal" TEXT,
ADD COLUMN     "clienteId" TEXT NOT NULL,
ADD COLUMN     "negocioId" TEXT NOT NULL,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "recusadoEm" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Orcamento_politicaComercialId_idx" ON "Orcamento"("politicaComercialId");

-- CreateIndex
CREATE INDEX "Orcamento_condicaoComercialId_idx" ON "Orcamento"("condicaoComercialId");

-- CreateIndex
CREATE INDEX "ItemOrcamento_negocioId_idx" ON "ItemOrcamento"("negocioId");

-- CreateIndex
CREATE INDEX "AceiteOrcamento_negocioId_idx" ON "AceiteOrcamento"("negocioId");

-- CreateIndex
CREATE INDEX "AceiteOrcamento_clienteId_idx" ON "AceiteOrcamento"("clienteId");

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_politicaComercialId_fkey" FOREIGN KEY ("politicaComercialId") REFERENCES "PoliticaComercial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_condicaoComercialId_fkey" FOREIGN KEY ("condicaoComercialId") REFERENCES "CondicaoComercial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrcamento" ADD CONSTRAINT "ItemOrcamento_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AceiteOrcamento" ADD CONSTRAINT "AceiteOrcamento_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AceiteOrcamento" ADD CONSTRAINT "AceiteOrcamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

