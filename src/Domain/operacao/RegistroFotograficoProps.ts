import { TipoRegistroFotografico } from "./tipo_registro_fotografico_types";

// Propriedades da entidade RegistroFotografico.
// Foto vinculada à ordem de serviço; `url` é apenas referência/caminho
// (sem upload real nesta etapa). `anexoId` é opcional para futuro módulo de anexos.
export interface RegistroFotograficoProps {
  id: string;
  negocioId: string;
  ordemServicoId: string;
  veiculoId: string;
  tipo: TipoRegistroFotografico;
  url: string;
  anexoId?: string | null;
  descricao?: string | null;
  responsavelId?: string | null;
  registradoEm: Date;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo RegistroFotografico.
export interface CriarRegistroFotograficoProps {
  negocioId: string;
  ordemServicoId: string;
  veiculoId: string;
  tipo: TipoRegistroFotografico;
  url: string;
  anexoId?: string | null;
  descricao?: string | null;
  responsavelId?: string | null;
  registradoEm?: Date;
}
