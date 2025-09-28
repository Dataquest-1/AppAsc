import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EstadoCotizacion {
  BORRADOR = 'borrador',
  EN_REVISION = 'en_revision',
  LISTA_ENVIO = 'lista_envio',
  ENVIADA = 'enviada',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  CERRADA = 'cerrada',
}

export class CambiarEstadoDto {
  @ApiProperty({
    description: 'Nuevo estado de la cotización',
    enum: EstadoCotizacion,
    example: EstadoCotizacion.EN_REVISION,
  })
  @IsEnum(EstadoCotizacion)
  estado: EstadoCotizacion;
}
