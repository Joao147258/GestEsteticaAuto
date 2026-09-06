// Contrato de infraestrutura para geração e comparação segura de hashes de senhas.
// A Application depende apenas deste contrato abstrato, desacoplada do algoritmo (bcrypt).
export abstract class HashService {
  abstract hash(plain: string): Promise<string>;
  abstract compare(plain: string, hash: string): Promise<boolean>;
}
