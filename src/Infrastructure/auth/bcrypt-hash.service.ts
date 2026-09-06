import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { HashService } from '../../Application/auth/services/hash.service';

// BcryptHashService — implementação concreta de hashing de senhas utilizando bcryptjs.
// Criptografa com salt cost 10 para equilíbrio entre segurança e performance.
@Injectable()
export class BcryptHashService implements HashService {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
