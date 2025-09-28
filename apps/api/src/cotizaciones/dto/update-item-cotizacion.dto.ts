import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Urgencia } from './add-item-cotizacion.dto';

export class UpdateItemCotizacionDto {
  @ApiProperty({
    description: 'Descripción del item',
    example: 'Cambio de impulsor principal - Actualizado',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Cantidad del item',
    example: 2,
    minimum: 0.01,
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  cantidad?: number;

  @ApiProperty({
    description: 'Precio unitario (solo admin y líderes)',
    example: 350000,
    minimum: 0,
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  precioUnitario?: number;

  @ApiProperty({
    description: 'Nivel de urgencia del item',
    enum: Urgencia,
    example: Urgencia.ALTA,
    required: false,
  })
  @IsEnum(Urgencia)
  @IsOptional()
  urgencia?: Urgencia;
}
