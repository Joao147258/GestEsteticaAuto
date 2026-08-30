import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/Presentation/app.module';

// Smoke test de bootstrap — valida apenas que o módulo raiz real compila e
// que os providers resolvem (pega erros de DI sem testar regras de negócio).
describe('Bootstrap (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('aplicaçao sobe e resolve o modulo raiz', () => {
    expect(app).toBeDefined();
  });

  afterEach(async () => {
    await app.close();
  });
});
