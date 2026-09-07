-- AlterTable
ALTER TABLE "Orcamento" ADD COLUMN IF NOT EXISTS "formaPagamentoPrevista" TEXT;
ALTER TABLE "Orcamento" ADD COLUMN IF NOT EXISTS "condicaoPagamento" TEXT;
ALTER TABLE "Orcamento" ADD COLUMN IF NOT EXISTS "observacaoPagamento" TEXT;
