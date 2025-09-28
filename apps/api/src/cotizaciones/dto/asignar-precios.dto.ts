import { IsArray, IsNumber, IsUUID, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ItemPrecioDto {
  @ApiProperty({
    description: 'ID del item de cotización',
    example: '550e8400-e29b-41d4-a716-446655440070',
  })
  @IsUUID()
  itemId: string;

  @ApiProperty({
    description: 'Cantidad del item',
    example: 1,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  cantidad: number;

  @ApiProperty({
    description: 'Precio unitario',
    example: 350000,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioUnitario: number;
}

export class AsignarPreciosDto {
  @ApiProperty({
    description: 'Lista de items con sus precios',
    type: [ItemPrecioDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPrecioDto)
  items: ItemPrecioDto[];

  @ApiProperty({
    description: 'Porcentaje de impuestos a aplicar',
    example: 19,
    minimum: 0,
    maximum: 100,
    default: 19,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  porcentajeImpuestos: number = 19;
}
