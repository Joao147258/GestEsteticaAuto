// Dispatcher dos scripts de depuração do domínio.
// Uso:
//   npm run dbg                 → roda todos os módulos
//   npm run dbg -- cliente      → roda apenas um módulo
//   npm run dbg -- simulacao    → simulação integrada (fluxo real)
//
// Módulos disponíveis: cliente, catalogo, comercial, estoque, estoque_venda,
// financeiro, negocio, operacao, shared, veiculos, simulacao.
import { executarCliente } from "./cliente";
import { executarCatalogo } from "./catalogo";
import { executarComercial } from "./comercial";
import { executarEstoque } from "./estoque";
import { executarEstoqueVenda } from "./estoque_venda";
import { executarFinanceiro } from "./financeiro";
import { executarNegocio } from "./negocio";
import { executarOperacao } from "./operacao";
import { executarShared } from "./shared";
import { executarVeiculos } from "./veiculos";
import { executarSimulacaoReal } from "./simulacao_real";

// Registro de módulos: nome → função de depuração.
const modulos: Record<string, () => void> = {
  cliente: executarCliente,
  catalogo: executarCatalogo,
  comercial: executarComercial,
  estoque: executarEstoque,
  estoque_venda: executarEstoqueVenda,
  financeiro: executarFinanceiro,
  negocio: executarNegocio,
  operacao: executarOperacao,
  shared: executarShared,
  veiculos: executarVeiculos,
  simulacao: executarSimulacaoReal,
};

function main(): void {
  const nomeModulo = process.argv[2];

  // Sem argumento: roda todos os módulos em sequência.
  if (!nomeModulo) {
    for (const executar of Object.values(modulos)) {
      executar();
    }
    console.log("\nDepuração de todos os módulos concluída com sucesso.");
    return;
  }

  const executar = modulos[nomeModulo];
  if (!executar) {
    console.error(`Módulo desconhecido: "${nomeModulo}".`);
    console.error(`Disponíveis: ${Object.keys(modulos).join(", ")}`);
    process.exit(1);
  }

  executar();
  console.log(`\nDepuração do módulo "${nomeModulo}" concluída com sucesso.`);
}

main();
