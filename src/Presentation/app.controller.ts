import { Controller, Get } from '@nestjs/common';

// Rota raiz da API — identificação mínima do serviço.
// Sem regra de negócio: apenas expõe que a API está no ar. O diagnóstico de
// banco fica em /health.
@Controller()
export class AppController {
  @Get()
  raiz() {
    return {
      api: 'gest-estetica-auto',
      status: 'online',
      documentacao: '/health',
    };
  }
}
