import { Injectable } from '@nestjs/common';
import {
  AtualizarVeiculoUseCase,
  BuscarVeiculoUseCase,
  CriarVeiculoUseCase,
  ListarVeiculosUseCase,
  RemoverVeiculoUseCase,
} from '../../../Application/veiculos';
import { CriarVeiculoDto } from './dto/criar-veiculo.dto';
import { AtualizarVeiculoDto } from './dto/atualizar-veiculo.dto';
import { ListarVeiculosQueryDto } from './dto/listar-veiculos-query.dto';

// VeiculosService — ponte entre o controller HTTP e os use cases da Application.
// Não contém regra de negócio: orquestra a chamada para cada caso de uso.
@Injectable()
export class VeiculosService {
  constructor(
    private readonly criarVeiculoUseCase: CriarVeiculoUseCase,
    private readonly atualizarVeiculoUseCase: AtualizarVeiculoUseCase,
    private readonly buscarVeiculoUseCase: BuscarVeiculoUseCase,
    private readonly listarVeiculosUseCase: ListarVeiculosUseCase,
    private readonly removerVeiculoUseCase: RemoverVeiculoUseCase,
  ) {}

  async criar(input: CriarVeiculoDto) {
    return this.criarVeiculoUseCase.execute({
      negocioId: input.negocioId,
      clienteId: input.clienteId,
      placa: input.placa,
      chassi: input.chassi,
      renavam: input.renavam,
      marca: input.marca,
      modelo: input.modelo,
      anoFabricacao: input.anoFabricacao,
      anoModelo: input.anoModelo,
      cor: input.cor,
      quilometragem: input.quilometragem,
      observacoes: input.observacoes,
    });
  }

  async listar(query: ListarVeiculosQueryDto) {
    return this.listarVeiculosUseCase.execute({
      negocioId: query.negocioId,
      clienteId: query.clienteId,
      busca: query.busca,
      pagina: query.pagina,
      limite: query.limite,
    });
  }

  async buscarPorId(negocioId: string, veiculoId: string) {
    return this.buscarVeiculoUseCase.execute({
      negocioId,
      veiculoId,
    });
  }

  async atualizar(veiculoId: string, input: AtualizarVeiculoDto) {
    return this.atualizarVeiculoUseCase.execute({
      negocioId: input.negocioId,
      veiculoId,
      placa: input.placa,
      marca: input.marca,
      modelo: input.modelo,
      anoFabricacao: input.anoFabricacao,
      anoModelo: input.anoModelo,
      cor: input.cor,
      quilometragem: input.quilometragem,
      observacoes: input.observacoes,
    });
  }

  async remover(negocioId: string, veiculoId: string) {
    await this.removerVeiculoUseCase.execute({
      negocioId,
      veiculoId,
    });
  }
}
