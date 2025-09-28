import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Urgencia {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
}

export class AddItemCotizacionDto {
  @ApiProperty({
    description: 'Descripción del item',
    example: 'Cambio de impulsor principal',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    description: 'Cantidad del item',
    example: 1,
    minimum: 0.01,
    default: 1,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  cantidad?: number = 1;

  @ApiProperty({
    description: 'Nivel de urgencia del item',
    enum: Urgencia,
    example: Urgencia.ALTA,
    default: Urgencia.MEDIA,
  })
  @IsEnum(Urgencia)
  @IsOptional()
  urgencia?: Urgencia = Urgencia.MEDIA;
}
