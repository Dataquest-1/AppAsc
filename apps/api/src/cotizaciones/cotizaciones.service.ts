import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { UpdateCotizacionDto } from './dto/update-cotizacion.dto';
import { AddItemCotizacionDto } from './dto/add-item-cotizacion.dto';
import { UpdateItemCotizacionDto } from './dto/update-item-cotizacion.dto';
import { AsignarPreciosDto } from './dto/asignar-precios.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { PdfService, CotizacionPdfData } from '../shared/pdf/pdf.service';

@Injectable()
export class CotizacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async create(createCotizacionDto: CreateCotizacionDto, user: CurrentUserData) {
    // Generar número de cotización
    const count = await this.prisma.cotizacion.count({
      where: { empresaId: user.empresaId },
    });
    const numero = `COT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    return this.prisma.cotizacion.create({
      data: {
        ...createCotizacionDto,
        numero,
        empresaId: user.empresaId,
        creadoPor: user.id,
      },
      include: {
        cliente: true,
        activo: true,
        usuarioCreadoPor: {
          select: { id: true, nombre: true, apellido: true, rol: true },
        },
        items: {
          include: {
            usuarioAgregadoPor: {
              select: { id: true, nombre: true, apellido: true, rol: true },
            },
            usuarioPrecioAsignado: {
              select: { id: true, nombre: true, apellido: true, rol: true },
            },
          },
        },
      },
    });
  }

  async findAll(user: CurrentUserData) {
    return this.prisma.cotizacion.findMany({
      where: { empresaId: user.empresaId },
      include: {
        cliente: true,
        activo: true,
        usuarioCreadoPor: {
          select: { id: true, nombre: true, apellido: true, rol: true },
        },
        usuarioAprobadoPor: {
          select: { id: true, nombre: true, apellido: true, rol: true },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: CurrentUserData) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: {
        cliente: true,
        activo: true,
        usuarioCreadoPor: {
          select: { id: true, nombre: true, apellido: true, rol: true },
        },
        usuarioAprobadoPor: {
          select: { id: true, nombre: true, apellido: true, rol: true },
        },
        items: {
          include: {
            usuarioAgregadoPor: {
              select: { id: true, nombre: true, apellido: true, rol: true },
            },
            usuarioPrecioAsignado: {
              select: { id: true, nombre: true, apellido: true, rol: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Si es técnico, ocultar precios
    if (user.rol === 'tecnico') {
      cotizacion.items = cotizacion.items.map(item => ({
        ...item,
        precioUnitario: null,
        subtotal: null,
      }));
      cotizacion.subtotal = null;
      cotizacion.impuestos = null;
      cotizacion.total = null;
    }

    return cotizacion;
  }

  async update(id: string, updateCotizacionDto: UpdateCotizacionDto, user: CurrentUserData) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Solo admin y lider_equipo pueden editar cotizaciones
    if (user.rol === 'tecnico') {
      throw new ForbiddenException('Los técnicos no pueden editar cotizaciones');
    }

    // No se puede editar si está enviada o aprobada
    if (['enviada', 'aprobada', 'rechazada', 'cerrada'].includes(cotizacion.estado)) {
      throw new BadRequestException('No se puede editar una cotización en estado ' + cotizacion.estado);
    }

    return this.prisma.cotizacion.update({
      where: { id },
      data: updateCotizacionDto,
      include: {
        cliente: true,
        activo: true,
        items: true,
      },
    });
  }

  async addItem(cotizacionId: string, addItemDto: AddItemCotizacionDto, user: CurrentUserData) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // No se pueden agregar items si está enviada o aprobada
    if (['enviada', 'aprobada', 'rechazada', 'cerrada'].includes(cotizacion.estado)) {
      throw new BadRequestException('No se pueden agregar items a una cotización en estado ' + cotizacion.estado);
    }

    return this.prisma.cotizacionItem.create({
      data: {
        ...addItemDto,
        cotizacionId,
        empresaId: user.empresaId,
        agregadoPor: user.id,
      },
      include: {
        usuarioAgregadoPor: {
          select: { id: true, nombre: true, apellido: true, rol: true },
        },
      },
    });
  }

  async updateItem(itemId: string, updateItemDto: UpdateItemCotizacionDto, user: CurrentUserData) {
    const item = await this.prisma.cotizacionItem.findUnique({
      where: { id: itemId },
      include: { cotizacion: true },
    });

    if (!item) {
      throw new NotFoundException('Item no encontrado');
    }

    // No se puede editar si la cotización está enviada o aprobada
    if (['enviada', 'aprobada', 'rechazada', 'cerrada'].includes(item.cotizacion.estado)) {
      throw new BadRequestException('No se puede editar item de cotización en estado ' + item.cotizacion.estado);
    }

    // Los técnicos solo pueden editar descripción y urgencia, no precios
    if (user.rol === 'tecnico') {
      const { precioUnitario, ...allowedFields } = updateItemDto;
      return this.prisma.cotizacionItem.update({
        where: { id: itemId },
        data: allowedFields,
      });
    }

    return this.prisma.cotizacionItem.update({
      where: { id: itemId },
      data: updateItemDto,
    });
  }

  async asignarPrecios(cotizacionId: string, asignarPreciosDto: AsignarPreciosDto, user: CurrentUserData) {
    // Solo admin y lider_equipo pueden asignar precios
    if (user.rol === 'tecnico') {
      throw new ForbiddenException('Los técnicos no pueden asignar precios');
    }

    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: { items: true },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    if (['enviada', 'aprobada', 'rechazada', 'cerrada'].includes(cotizacion.estado)) {
      throw new BadRequestException('No se pueden asignar precios a cotización en estado ' + cotizacion.estado);
    }

    // Actualizar precios de items
    await Promise.all(
      asignarPreciosDto.items.map(async (itemUpdate) => {
        const subtotal = itemUpdate.cantidad * itemUpdate.precioUnitario;
        return this.prisma.cotizacionItem.update({
          where: { id: itemUpdate.itemId },
          data: {
            precioUnitario: itemUpdate.precioUnitario,
            subtotal,
            precioAsignadoPor: user.id,
          },
        });
      })
    );

    // Recalcular totales de la cotización
    const subtotal = asignarPreciosDto.items.reduce(
      (sum, item) => sum + (item.cantidad * item.precioUnitario),
      0
    );
    const impuestos = subtotal * (asignarPreciosDto.porcentajeImpuestos / 100);
    const total = subtotal + impuestos;

    return this.prisma.cotizacion.update({
      where: { id: cotizacionId },
      data: {
        subtotal,
        impuestos,
        total,
        estado: 'en_revision',
      },
      include: {
        items: true,
        cliente: true,
        activo: true,
      },
    });
  }

  async cambiarEstado(id: string, nuevoEstado: string, user: CurrentUserData) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Validar transiciones de estado
    const transicionesValidas = {
      'borrador': ['en_revision'],
      'en_revision': ['lista_envio', 'borrador'],
      'lista_envio': ['enviada', 'en_revision'],
      'enviada': ['aprobada', 'rechazada'],
      'aprobada': ['cerrada'],
      'rechazada': ['cerrada'],
      'cerrada': [],
    };

    if (!transicionesValidas[cotizacion.estado]?.includes(nuevoEstado)) {
      throw new BadRequestException(`Transición inválida de ${cotizacion.estado} a ${nuevoEstado}`);
    }

    // Solo admin y lider_equipo pueden cambiar estados
    if (user.rol === 'tecnico' && !['borrador'].includes(nuevoEstado)) {
      throw new ForbiddenException('Los técnicos solo pueden cambiar cotizaciones a borrador');
    }

    const updateData: any = { estado: nuevoEstado };

    // Si se aprueba, registrar quien aprobó y cuándo
    if (nuevoEstado === 'aprobada') {
      updateData.aprobadoPor = user.id;
      updateData.fechaAprobacion = new Date();
    }

    return this.prisma.cotizacion.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, user: CurrentUserData) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Solo admin puede eliminar cotizaciones
    if (user.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden eliminar cotizaciones');
    }

    // No se puede eliminar si está aprobada
    if (['aprobada', 'cerrada'].includes(cotizacion.estado)) {
      throw new BadRequestException('No se puede eliminar una cotización aprobada o cerrada');
    }

    return this.prisma.cotizacion.delete({
      where: { id },
    });
  }

  async generatePdf(id: string, user: CurrentUserData): Promise<StreamableFile> {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: {
        cliente: true,
        activo: true,
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    if (cotizacion.empresaId !== user.empresaId) {
      throw new ForbiddenException('No tienes acceso a esta cotización');
    }

    const includePrecios = user.rol !== 'tecnico';
    const cotizacionPdfData = this.buildCotizacionPdfData(cotizacion, includePrecios);
    const pdfBuffer = await this.pdfService.createCotizacionPdf(cotizacionPdfData);
    const filename = this.buildPdfFilename(cotizacion.numero ?? id);

    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${filename}"`,
      length: pdfBuffer.length,
    });
  }

  private buildCotizacionPdfData(cotizacion: any, includePrecios: boolean): CotizacionPdfData {
    const sanitizedItems = cotizacion.items?.map((item) => ({
      ...item,
      precioUnitario: includePrecios ? item.precioUnitario : null,
      subtotal: includePrecios ? item.subtotal : null,
    })) ?? [];

    return {
      numero: cotizacion.numero,
      estado: cotizacion.estado,
      createdAt: cotizacion.createdAt,
      cliente: cotizacion.cliente,
      activo: cotizacion.activo,
      items: sanitizedItems,
      subtotal: includePrecios ? cotizacion.subtotal : null,
      impuestos: includePrecios ? cotizacion.impuestos : null,
      total: includePrecios ? cotizacion.total : null,
      includePrecios,
    };
  }

  private buildPdfFilename(numero: string): string {
    const base = numero.replace(/[^a-zA-Z0-9-_]/g, '_');
    return `cotizacion-${base}.pdf`;
  }
}
