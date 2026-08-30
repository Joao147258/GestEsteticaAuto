import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = moduleFixture.get(AppController);
  });

  it('retorna identificação da API na rota raiz', () => {
    expect(controller.raiz()).toMatchObject({
      api: 'gest-estetica-auto',
      status: 'online',
    });
  });
});
