import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

export interface JwtPayload {
  sub: string;
  username: string;
  empresaId: string;
  empresaCodigo: string;
  rol: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: string;
    empresa: {
      id: string;
      codigo: string;
      nombre: string;
    };
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(empresaCodigo: string, username: string, password: string): Promise<any> {
    // Buscar empresa por código
    const empresa = await this.prisma.empresa.findUnique({
      where: { codigo: empresaCodigo },
    });

    if (!empresa || !empresa.activa) {
      throw new UnauthorizedException('Empresa no encontrada o inactiva');
    }

    // Buscar usuario en el contexto de la empresa
    await this.prisma.setEmpresaContext(empresa.id);
    
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        empresaId_username: {
          empresaId: empresa.id,
          username: username,
        },
      },
      include: {
        empresa: true,
      },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() },
    });

    const { passwordHash, ...result } = usuario;
    return result;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { empresaCodigo, username, password } = loginDto;

    const user = await this.validateUser(empresaCodigo, username, password);

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      empresaId: user.empresaId,
      empresaCodigo: user.empresa.codigo,
      rol: user.rol,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        empresa: {
          id: user.empresa.id,
          codigo: user.empresa.codigo,
          nombre: user.empresa.nombre,
        },
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Verificar que el usuario sigue activo
      await this.prisma.setEmpresaContext(payload.empresaId);
      const user = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
        include: { empresa: true },
      });

      if (!user || !user.activo || !user.empresa.activa) {
        throw new UnauthorizedException('Usuario o empresa inactivos');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        username: user.username,
        empresaId: user.empresaId,
        empresaCodigo: user.empresa.codigo,
        rol: user.rol,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Token de refresco inválido');
    }
  }

  async validateJwtPayload(payload: JwtPayload): Promise<any> {
    await this.prisma.setEmpresaContext(payload.empresaId);
    
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: { empresa: true },
    });

    if (!user || !user.activo || !user.empresa.activa) {
      throw new UnauthorizedException('Usuario o empresa inactivos');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      empresaId: user.empresaId,
      empresaCodigo: user.empresa.codigo,
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
