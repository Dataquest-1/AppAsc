import { Controller, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmpresasService } from './empresas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Role } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('empresas')
@Controller('empresas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Listar empresas activas',
    description: 'Solo administradores pueden ver todas las empresas'
  })
  @ApiResponse({ status: 200, description: 'Lista de empresas' })
  @ApiResponse({ status: 403, description: 'Solo administradores' })
  findAll() {
    return this.empresasService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Obtener empresa por ID',
    description: 'Detalles de una empresa específica'
  })
  @ApiResponse({ status: 200, description: 'Detalles de la empresa' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.empresasService.findOne(id);
  }
}
