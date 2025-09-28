import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class EmpresasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.empresa.findMany({
      where: { activa: true },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        email: true,
        telefono: true,
        direccion: true,
        logoUrl: true,
        activa: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.empresa.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usuarios: true,
            clientes: true,
            activos: true,
          },
        },
      },
    });
  }

  async findByCodigo(codigo: string) {
    return this.prisma.empresa.findUnique({
      where: { codigo },
    });
  }
}
