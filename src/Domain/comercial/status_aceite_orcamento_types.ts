// Status do aceite de orçamento.
export type StatusAceiteOrcamento = "PENDENTE" | "ACEITO" | "RECUSADO" | "CANCELADO";

// Canal pelo qual o cliente deu a resposta (presencial, WhatsApp etc.).
export type CanalAceiteOrcamento =
  | "PRESENCIAL"
  | "WHATSAPP"
  | "EMAIL"
  | "TELEFONE"
  | "OUTRO";
