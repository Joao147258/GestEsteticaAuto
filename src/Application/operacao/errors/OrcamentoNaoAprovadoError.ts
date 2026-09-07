import { ValidationError } from "../../../Shared/errors/validation.error";

// Orçamento existe mas não está ACEITO: apenas orçamentos aprovados (ACEITO)
// podem gerar Ordem de Serviço.
export class OrcamentoNaoAprovadoError extends ValidationError {}
