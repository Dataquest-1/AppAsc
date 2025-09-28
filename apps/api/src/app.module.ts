import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

// Core modules
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';

// Feature modules
import { EmpresasModule } from './empresas/empresas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ClientesModule } from './clientes/clientes.module';
import { ActivosModule } from './activos/activos.module';
import { FormulariosModule } from './formularios/formularios.module';
import { PlanesMantenimientoModule } from './planes-mantenimiento/planes-mantenimiento.module';
import { CotizacionesModule } from './cotizaciones/cotizaciones.module';
import { OrdenesTrabajoModule } from './ordenes-trabajo/ordenes-trabajo.module';
import { EmergenciasModule } from './emergencias/emergencias.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DocumentosModule } from './documentos/documentos.module';
import { ExternalApiModule } from './external-api/external-api.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { AjustesEmpresaModule } from './ajustes-empresa/ajustes-empresa.module';

// Shared modules
import { StorageModule } from './shared/storage/storage.module';
import { MailModule } from './shared/mail/mail.module';
import { PdfModule } from './shared/pdf/pdf.module';
import { CronModule } from './shared/cron/cron.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Scheduling
    ScheduleModule.forRoot(),

    // Queue management
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
        },
      }),
    }),

    // Cache
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        ttl: 300, // 5 minutes default TTL
      }),
    }),

    // Core modules
    DatabaseModule,
    AuthModule,

    // Feature modules
    EmpresasModule,
    UsuariosModule,
    ClientesModule,
    ActivosModule,
    FormulariosModule,
    PlanesMantenimientoModule,
    CotizacionesModule,
    OrdenesTrabajoModule,
    EmergenciasModule,
    DashboardModule,
    DocumentosModule,
    ExternalApiModule,
    BitacoraModule,
    AjustesEmpresaModule,

    // Shared modules
    StorageModule,
    MailModule,
    PdfModule,
    CronModule,
  ],
})
export class AppModule {}
