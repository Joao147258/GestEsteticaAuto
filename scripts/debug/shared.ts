// Depuração do módulo shared (Anexo e Auditoria).
import { Anexo } from "../../src/Domain/shared/anexo";
import { Auditoria } from "../../src/Domain/shared/auditoria";
import { mostrar } from "./_utils";

export function executarShared(): void {
  const anexo = Anexo.criar({
    id: "anx-1",
    negocioId: "neg-123",
    nome: "foto_danificado.png",
    tipo: "FOTO",
    mimeType: "image/png",
    url: "https://storage.example.com/foto_danificado.png",
    tamanho: 204800,
    criadoEm: new Date(),
  });

  mostrar("Anexo criado", {
    id: anexo.id,
    nome: anexo.nome,
    mimeType: anexo.mimeType,
    url: anexo.url,
    tamanho: anexo.tamanho,
  });

  const auditoria = Auditoria.criar({
    id: "aud-1",
    negocioId: "neg-123",
    entidade: "Cliente",
    entidadeId: "cli-1",
    acao: "CRIAR",
    usuarioId: "usr-1",
    dados: { origem: "Google" },
    criadoEm: new Date(),
  });

  mostrar("Auditoria criada", {
    id: auditoria.id,
    entidade: auditoria.entidade,
    acao: auditoria.acao,
    usuarioId: auditoria.usuarioId,
    dados: auditoria.dados,
  });
}
