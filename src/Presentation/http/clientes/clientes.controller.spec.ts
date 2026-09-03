import { Cliente } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ClientesController } from "./clientes.controller";
import { ClientesService } from "./clientes.service";
import { AtualizarClienteDto } from "./dto/atualizar-cliente.dto";
import { CriarClienteDto } from "./dto/criar-cliente.dto";
import { ListarClientesQueryDto } from "./dto/listar-clientes-query.dto";
import { ClientePresenter } from "./presenters/cliente.presenter";

// ClientesController depende do ClientesService (que orquestra os use cases),
// então a spec mocka apenas esse service — mesmo espírito do spec comercial,
// que mocka os use cases.
describe("ClientesController", () => {
  function montar() {
    const clientesService = {
      criar: jest.fn(),
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      atualizar: jest.fn(),
      remover: jest.fn(),
    } as unknown as ClientesService;

    const controller = new ClientesController(clientesService);

    return { controller, clientesService };
  }

  function criarCliente(): Cliente {
    return Cliente.criar({
      negocioId: "neg-1",
      nome: "João Pereira",
      tipo: "PESSOA_FISICA",
      telefone: "83999999999",
      email: "joao@email.com",
    });
  }

  function criarDto(): CriarClienteDto {
    const dto = new CriarClienteDto();
    dto.negocioId = "neg-1";
    dto.nome = "João Pereira";
    dto.tipo = "PESSOA_FISICA";
    dto.telefone = "83999999999";
    dto.email = "joao@email.com";
    return dto;
  }

  describe("criar (POST /admin/clientes)", () => {
    it("chama ClientesService.criar com o DTO e devolve o presenter do cliente", async () => {
      const { controller, clientesService } = montar();
      const cliente = criarCliente();
      clientesService.criar = jest.fn().mockResolvedValue(cliente);

      const resultado = await controller.criar(criarDto());

      expect(clientesService.criar).toHaveBeenCalledWith(criarDto());
      expect(resultado).toEqual(ClientePresenter.toHTTP(cliente));
    });
  });

  describe("listar (GET /admin/clientes)", () => {
    it("chama ClientesService.listar com a query e devolve a lista via presenter", async () => {
      const { controller, clientesService } = montar();
      const query = new ListarClientesQueryDto();
      query.negocioId = "neg-1";
      query.busca = "joão";
      query.pagina = 1;
      query.limite = 10;
      const clientes = [criarCliente()];
      clientesService.listar = jest.fn().mockResolvedValue(clientes);

      const resultado = await controller.listar(query);

      expect(clientesService.listar).toHaveBeenCalledWith(query);
      expect(resultado).toEqual(ClientePresenter.manyToHTTP(clientes));
    });
  });

  describe("buscarPorId (GET /admin/clientes/:id)", () => {
    it("chama ClientesService.buscarPorId e devolve o presenter do cliente", async () => {
      const { controller, clientesService } = montar();
      const cliente = criarCliente();
      clientesService.buscarPorId = jest.fn().mockResolvedValue(cliente);

      const resultado = await controller.buscarPorId(cliente.id, "neg-1");

      expect(clientesService.buscarPorId).toHaveBeenCalledWith(
        "neg-1",
        cliente.id,
      );
      expect(resultado).toEqual(ClientePresenter.toHTTP(cliente));
    });

    it("lança NotFoundError quando o service devolve null", async () => {
      const { controller, clientesService } = montar();
      clientesService.buscarPorId = jest.fn().mockResolvedValue(null);

      await expect(
        controller.buscarPorId("inexistente", "neg-1"),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("atualizar (PATCH /admin/clientes/:id)", () => {
    it("chama ClientesService.atualizar com id do path e DTO do body", async () => {
      const { controller, clientesService } = montar();
      const cliente = criarCliente();
      clientesService.atualizar = jest.fn().mockResolvedValue(cliente);
      const dto = new AtualizarClienteDto();
      dto.negocioId = "neg-1";
      dto.telefone = "83988888888";

      const resultado = await controller.atualizar(cliente.id, dto);

      expect(clientesService.atualizar).toHaveBeenCalledWith(cliente.id, dto);
      expect(resultado).toEqual(ClientePresenter.toHTTP(cliente));
    });
  });

  describe("remover (DELETE /admin/clientes/:id)", () => {
    it("chama ClientesService.remover com negocioId da query e id do path", async () => {
      const { controller, clientesService } = montar();
      clientesService.remover = jest.fn().mockResolvedValue(undefined);

      await controller.remover("cli-1", "neg-1");

      expect(clientesService.remover).toHaveBeenCalledWith("neg-1", "cli-1");
    });
  });

  describe("proteções estruturais", () => {
    it("não acessa Prisma diretamente — depende apenas do ClientesService", () => {
      const { controller } = montar();
      const dependencias = controller as unknown as Record<string, unknown>;

      expect(dependencias).not.toHaveProperty("prisma");
      expect(dependencias).not.toHaveProperty("prismaService");
    });

    it("não contém regra de negócio — propaga o erro do service", async () => {
      const { controller, clientesService } = montar();
      clientesService.criar = jest
        .fn()
        .mockRejectedValue(new Error("erro de domínio"));

      await expect(controller.criar(criarDto())).rejects.toThrow(
        "erro de domínio",
      );
    });
  });
});
