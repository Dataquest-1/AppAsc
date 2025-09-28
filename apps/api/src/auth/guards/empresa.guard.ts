import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class EmpresaGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    if (!user?.empresaId) {
      throw new ForbiddenException('Usuario sin empresa asignada');
    }

    // Si hay un parámetro empresaId en la URL, verificar que coincida
    if (params.empresaId && params.empresaId !== user.empresaId) {
      throw new ForbiddenException('Acceso denegado a recursos de otra empresa');
    }

    // Establecer contexto de empresa para RLS
    await this.prisma.setEmpresaContext(user.empresaId);

    return true;
  }
}
