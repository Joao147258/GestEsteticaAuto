import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Decorator @Public() — marca rotas que não exigem token de autenticação JWT
// (como /health, /auth/login e /auth/logout).
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
