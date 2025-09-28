import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    
    // Enable RLS by default for all connections
    await this.$executeRaw`SET row_security = on`;
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Set empresa_id context for RLS
   */
  async setEmpresaContext(empresaId: string) {
    await this.$executeRaw`SELECT set_config('app.empresa_id', ${empresaId}, false)`;
  }

  /**
   * Clear empresa_id context
   */
  async clearEmpresaContext() {
    await this.$executeRaw`SELECT set_config('app.empresa_id', '', false)`;
  }

  /**
   * Execute query with empresa context
   */
  async withEmpresaContext<T>(empresaId: string, callback: () => Promise<T>): Promise<T> {
    await this.setEmpresaContext(empresaId);
    try {
      return await callback();
    } finally {
      await this.clearEmpresaContext();
    }
  }
}
