import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CotizacionesService } from './cotizaciones.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { UpdateCotizacionDto } from './dto/update-cotizacion.dto';
import { AddItemCotizacionDto } from './dto/add-item-cotizacion.dto';
import { UpdateItemCotizacionDto } from './dto/update-item-cotizacion.dto';
import { AsignarPreciosDto } from './dto/asignar-precios.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Role } from '../auth/guards/roles.guard';
import { EmpresaGuard } from '../auth/guards/empresa.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('cotizaciones')
@Controller('cotizaciones')
@UseGuards(JwtAuthGuard, EmpresaGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CotizacionesController {
  constructor(private readonly cotizacionesService: CotizacionesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear nueva cotización',
    description: 'Crear una cotización anclada a cliente y activo'
  })
  @ApiResponse({ status: 201, description: 'Cotización creada exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  create(
    @Body() createCotizacionDto: CreateCotizacionDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.cotizacionesService.create(createCotizacionDto, user);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar cotizaciones',
    description: 'Obtener todas las cotizaciones de la empresa'
  })
  @ApiResponse({ status: 200, description: 'Lista de cotizaciones' })
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.cotizacionesService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener cotización por ID',
    description: 'Obtener detalles de una cotización específica. Los técnicos no ven precios.'
  })
  @ApiResponse({ status: 200, description: 'Detalles de la cotización' })
  @ApiResponse({ status: 404, description: 'Cotización no encontrada' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.cotizacionesService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.LIDER_EQUIPO)
  @ApiOperation({ 
    summary: 'Actualizar cotización',
    description: 'Actualizar datos básicos de la cotización. Solo admin y líderes.'
  })
  @ApiResponse({ status: 200, description: 'Cotización actualizada' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCotizacionDto: UpdateCotizacionDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.cotizacionesService.update(id, updateCotizacionDto, user);
  }

  @Post(':id/items')
  @ApiOperation({ 
    summary: 'Agregar item a cotización',
    description: 'Los técnicos pueden agregar items sin precio, con urgencia'
  })
  @ApiResponse({ status: 201, description: 'Item agregado exitosamente' })
  addItem(
    @Param('id', ParseUUIDPipe) cotizacionId: string,
    @Body() addItemDto: AddItemCotizacionDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.cotizacionesService.addItem(cotizacionId, addItemDto, user);
  }

  @Patch('items/:itemId')
  @ApiOperation({ 
    summary: 'Actualizar item de cotización',
    description: 'Técnicos solo pueden editar descripción y urgencia, no precios'
  })
  @ApiResponse({ status: 200, description: 'Item actualizado' })
  updateItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateItemDto: UpdateItemCotizacionDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.cotizacionesService.updateItem(itemId, updateItemDto, user);
  }

  @Post(':id/asignar-precios')
  @Roles(Role.ADMIN, Role.LIDER_EQUIPO)
  @ApiOperation({ 
    summary: 'Asignar precios a items',
    description: 'Solo admin y líderes pueden asignar precios e impuestos'
  })
  @ApiResponse({ status: 200, description: 'Precios asignados exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo admin y líderes' })
  asignarPrecios(
    @Param('id', ParseUUIDPipe) cotizacionId: string,
    @Body() asignarPreciosDto: AsignarPreciosDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.cotizacionesService.asignarPrecios(cotizacionId, asignarPreciosDto, user);
  }

  @Patch(':id/estado')
  @ApiOperation({ 
    summary: 'Cambiar estado de cotización',
    description: 'Cambiar estado según máquina de estados y permisos RBAC'
  })
  @ApiResponse({ status: 200, description: 'Estado cambiado exitosamente' })
  @ApiResponse({ status: 400, description: 'Transición de estado inválida' })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cambiarEstadoDto: CambiarEstadoDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.cotizacionesService.cambiarEstado(id, cambiarEstadoDto.estado, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Eliminar cotización',
    description: 'Solo administradores pueden eliminar cotizaciones no aprobadas'
  })
  @ApiResponse({ status: 200, description: 'Cotización eliminada' })
  @ApiResponse({ status: 403, description: 'Solo administradores' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.cotizacionesService.remove(id, user);
  }
}
