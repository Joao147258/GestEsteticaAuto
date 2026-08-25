import { Veiculo } from "./veiculo";
import { VeiculoError } from "./VeiculoError";

describe("Veiculo", () => {
  describe("criar", () => {
    it("cria veículo com dados normalizados e status ATIVO", () => {
      const veiculo = Veiculo.criar({
        negocioId: "neg-1",
        clienteId: "cli-1",
        placa: " ABC1D23 ",
        marca: "  Fiat  ",
        modelo: "  Uno 1.0  ",
        anoFabricacao: 2019,
        cor: "Prata",
        quilometragem: 45000,
      });

      expect(veiculo.id).toBeTruthy();
      expect(veiculo.negocioId).toBe("neg-1");
      expect(veiculo.clienteId).toBe("cli-1");
      expect(veiculo.placa).toBe("ABC1D23");
      expect(veiculo.marca).toBe("Fiat");
      expect(veiculo.modelo).toBe("Uno 1.0");
      expect(veiculo.status).toBe("ATIVO");
    });

    it("lança VeiculoError quando clienteId é vazio", () => {
      expect(() =>
        Veiculo.criar({
          negocioId: "neg-1",
          clienteId: "",
          marca: "Fiat",
          modelo: "Uno",
        }),
      ).toThrow(VeiculoError);
    });

    it("lança VeiculoError quando marca é vazia", () => {
      expect(() =>
        Veiculo.criar({
          negocioId: "neg-1",
          clienteId: "cli-1",
          marca: "  ",
          modelo: "Uno",
        }),
      ).toThrow(VeiculoError);
    });

    it("lança VeiculoError quando modelo é vazio", () => {
      expect(() =>
        Veiculo.criar({
          negocioId: "neg-1",
          clienteId: "cli-1",
          marca: "Fiat",
          modelo: "  ",
        }),
      ).toThrow(VeiculoError);
    });

    it("lança VeiculoError quando quilometragem é negativa", () => {
      expect(() =>
        Veiculo.criar({
          negocioId: "neg-1",
          clienteId: "cli-1",
          marca: "Fiat",
          modelo: "Uno",
          quilometragem: -1,
        }),
      ).toThrow(VeiculoError);
    });
  });

  describe("alterações", () => {
    function criarVeiculo(): Veiculo {
      return Veiculo.criar({
        negocioId: "neg-1",
        clienteId: "cli-1",
        marca: "Fiat",
        modelo: "Uno",
      });
    }

    it("alterarMarca e alterarModelo validam vazio", () => {
      const veiculo = criarVeiculo();
      veiculo.alterarMarca("Volkswagen");
      expect(veiculo.marca).toBe("Volkswagen");
      expect(() => veiculo.alterarMarca("  ")).toThrow(VeiculoError);
      expect(() => veiculo.alterarModelo("  ")).toThrow(VeiculoError);
    });

    it("alterarKm valida negativo", () => {
      const veiculo = criarVeiculo();
      veiculo.alterarKm(50000);
      expect(veiculo.quilometragem).toBe(50000);
      expect(() => veiculo.alterarKm(-1)).toThrow(VeiculoError);
    });

    it("vincularCliente atualiza clienteId", () => {
      const veiculo = criarVeiculo();
      veiculo.vincularCliente("cli-2");
      expect(veiculo.clienteId).toBe("cli-2");
    });

    it("ativar e inativar", () => {
      const veiculo = criarVeiculo();
      veiculo.inativar();
      expect(veiculo.status).toBe("INATIVO");
      veiculo.ativar();
      expect(veiculo.status).toBe("ATIVO");
    });
  });

  describe("registro de alterações", () => {
    function criarVeiculoComPlaca(): Veiculo {
      return Veiculo.criar({
        negocioId: "neg-1",
        clienteId: "cli-1",
        marca: "Honda",
        modelo: "Civic",
        placa: "ABC1234",
      });
    }

    it("começa com histórico vazio na criação", () => {
      const veiculo = Veiculo.criar({
        negocioId: "neg-1",
        clienteId: "cli-1",
        marca: "Fiat",
        modelo: "Uno",
      });

      expect(veiculo.alteracoes).toEqual([]);
    });

    it("registra alteração de placa com valores e descrição", () => {
      const veiculo = criarVeiculoComPlaca();
      veiculo.alterarPlaca("DEF5678");

      expect(veiculo.alteracoes).toHaveLength(1);
      expect(veiculo.alteracoes[0]).toMatchObject({
        campo: "placa",
        valorAnterior: "ABC1234",
        valorNovo: "DEF5678",
        descricao: "Placa do veículo alterada",
      });
      expect(veiculo.alteracoes[0].alteradoEm).toBeInstanceOf(Date);
    });

    it("registra quilometragem partindo de null", () => {
      const veiculo = criarVeiculoComPlaca();
      veiculo.alterarKm(85000);

      expect(veiculo.alteracoes[0]).toMatchObject({
        campo: "quilometragem",
        valorAnterior: null,
        valorNovo: 85000,
      });
    });

    it("registra mudança de status ao inativar", () => {
      const veiculo = criarVeiculoComPlaca();
      veiculo.inativar();

      expect(veiculo.alteracoes[0]).toMatchObject({
        campo: "status",
        valorAnterior: "ATIVO",
        valorNovo: "INATIVO",
        descricao: "Veículo inativado",
      });
    });

    it("não registra alteração quando o valor não muda", () => {
      const veiculo = criarVeiculoComPlaca();
      veiculo.alterarPlaca("ABC1234");

      expect(veiculo.alteracoes).toHaveLength(0);
    });

    it("não registra alteração ao inativar veículo já inativo", () => {
      const veiculo = criarVeiculoComPlaca();
      veiculo.inativar();
      veiculo.inativar();

      expect(veiculo.alteracoes).toHaveLength(1);
    });

    it("acumula múltiplas alterações em ordem", () => {
      const veiculo = criarVeiculoComPlaca();
      veiculo.alterarPlaca("DEF5678");
      veiculo.alterarKm(85000);
      veiculo.inativar();

      expect(veiculo.alteracoes.map((a) => a.campo)).toEqual([
        "placa",
        "quilometragem",
        "status",
      ]);
    });

    it("getter devolve cópia — mutação externa não afeta o domínio", () => {
      const veiculo = criarVeiculoComPlaca();
      veiculo.alterarPlaca("DEF5678");

      veiculo.alteracoes.push({
        campo: "invalida",
        valorAnterior: null,
        valorNovo: null,
        alteradoEm: new Date(),
      });

      expect(veiculo.alteracoes).toHaveLength(1);
    });
  });
});
