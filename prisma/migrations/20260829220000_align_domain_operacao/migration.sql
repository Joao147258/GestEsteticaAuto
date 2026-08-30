-- AlterTable
ALTER TABLE "OrdemServico" ADD COLUMN     "abertaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "agendamentoId" TEXT,
ADD COLUMN     "canceladaEm" TIMESTAMP(3),
ADD COLUMN     "finalizadaEm" TIMESTAMP(3),
ADD COLUMN     "iniciadaEm" TIMESTAMP(3),
ADD COLUMN     "pausadaEm" TIMESTAMP(3),
ADD COLUMN     "previsaoConclusao" TIMESTAMP(3),
ADD COLUMN     "previsaoInicio" TIMESTAMP(3),
ADD COLUMN     "responsavelId" TEXT;

-- AlterTable
ALTER TABLE "ItemOrdemServico" ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "finalizadoEm" TIMESTAMP(3),
ADD COLUMN     "iniciadoEm" TIMESTAMP(3),
ADD COLUMN     "negocioId" TEXT NOT NULL,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "responsavelId" TEXT,
ALTER COLUMN "valorUnitario" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ItemOrdemServico_negocioId_idx" ON "ItemOrdemServico"("negocioId");

-- AddForeignKey
ALTER TABLE "ItemOrdemServico" ADD CONSTRAINT "ItemOrdemServico_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

