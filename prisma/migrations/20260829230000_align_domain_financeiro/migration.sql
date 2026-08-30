-- AlterTable
ALTER TABLE "Parcela" ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN     "negocioId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Pagamento_negocioId_idx" ON "Pagamento"("negocioId");

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

