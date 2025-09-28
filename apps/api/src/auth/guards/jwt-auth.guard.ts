import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await super.canActivate(context);
    
    if (result) {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      
      // Establecer contexto de empresa para RLS
      if (user?.empresaId) {
        await this.prisma.setEmpresaContext(user.empresaId);
      }
    }
    
    return result as boolean;
  }
}
