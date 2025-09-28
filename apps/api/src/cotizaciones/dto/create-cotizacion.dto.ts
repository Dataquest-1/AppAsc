import { IsString, IsNotEmpty, IsUUID, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCotizacionDto {
  @ApiProperty({
    description: 'ID del cliente',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @IsUUID()
  @IsNotEmpty()
  clienteId: string;

  @ApiProperty({
    description: 'ID del activo',
    example: '550e8400-e29b-41d4-a716-446655440020',
  })
  @IsUUID()
  @IsNotEmpty()
  activoId: string;

  @ApiProperty({
    description: 'Título de la cotización',
    example: 'Reparación Bomba Centrífuga Principal',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo: string;

  @ApiProperty({
    description: 'Descripción detallada de la cotización',
    example: 'Reparación completa de bomba con cambio de impulsores y sellos',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Días de validez de la cotización',
    example: 30,
    default: 30,
    required: false,
  })
  @IsOptional()
  validezDias?: number;
}
