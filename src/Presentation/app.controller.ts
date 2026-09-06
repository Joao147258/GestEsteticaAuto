import { Controller, Get } from '@nestjs/common';
import { Public } from './http/decorators/public.decorator';

// Rota raiz da API — identificação mínima do serviço.
// Sem regra de negócio: apenas expõe que a API está no ar. O diagnóstico de
// banco fica em /health.
@Controller()
export class AppController {
  @Public()
  @Get()
  raiz() {
    return {
      api: 'gest-estetica-auto',
      status: 'online',
      documentacao: '/health',
    };
  }
}
