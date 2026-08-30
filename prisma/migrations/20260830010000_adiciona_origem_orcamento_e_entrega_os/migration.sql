-- AlterTable
-- Canal de entrada do orçamento: PAINEL (padrão da V1) ou SITE (futuro).
-- O DEFAULT preenche registros existentes com PAINEL (comportamento seguro).
ALTER TABLE "Orcamento" ADD COLUMN     "origem" TEXT NOT NULL DEFAULT 'PAINEL';

-- AlterTable
-- Entrega ao cliente: timestamp preenchido quando a OS é entregue (ENTREGUE),
-- seguindo o padrão dos demais marcos (iniciadaEm/finalizadaEm/canceladaEm).
ALTER TABLE "OrdemServico" ADD COLUMN     "entregueEm" TIMESTAMP(3);
