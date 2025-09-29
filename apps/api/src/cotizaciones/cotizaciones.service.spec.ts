import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CotizacionesService } from './cotizaciones.service';
import { PrismaService } from '../database/prisma.service';
import { PdfService } from '../shared/pdf/pdf.service';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';

describe('CotizacionesService - generatePdf', () => {
  let service: CotizacionesService;
  let prisma: { cotizacion: { findUnique: jest.Mock } };
  let pdfService: { createCotizacionPdf: jest.Mock };

  const baseUser: CurrentUserData = {
    id: 'user-1',
    username: 'user',
    email: 'user@example.com',
    nombre: 'Usuario',
    apellido: 'Prueba',
    rol: 'admin',
    empresaId: 'empresa-1',
    empresaCodigo: 'EMP-1',
  };

  const cotizacionRecord = {
    id: 'cotizacion-1',
    numero: 'COT-1',
    empresaId: 'empresa-1',
    estado: 'borrador',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    subtotal: 100,
    impuestos: 19,
    total: 119,
    cliente: { nombre: 'ACME Corp', email: 'contacto@acme.com' },
    activo: { nombre: 'Motor principal', codigo: 'ACT-1' },
    items: [
      {
        id: 'item-1',
        descripcion: 'Revisión de motor',
        cantidad: 2,
        urgencia: 'alta',
        precioUnitario: 50,
        subtotal: 100,
        createdAt: new Date('2024-01-02T10:00:00Z'),
      },
    ],
  };

  beforeEach(() => {
    prisma = {
      cotizacion: {
        findUnique: jest.fn(),
      },
    };

    pdfService = {
      createCotizacionPdf: jest.fn(),
    };

    service = new CotizacionesService(
      prisma as unknown as PrismaService,
      pdfService as unknown as PdfService,
    );
  });

  it('throws NotFoundException when cotizacion does not exist', async () => {
    prisma.cotizacion.findUnique.mockResolvedValue(null);

    await expect(service.generatePdf('cotizacion-inexistente', baseUser)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws ForbiddenException when user belongs to another company', async () => {
    prisma.cotizacion.findUnique.mockResolvedValue({ ...cotizacionRecord, empresaId: 'empresa-2' });

    await expect(service.generatePdf('cotizacion-1', baseUser)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('returns a StreamableFile with pricing information for privileged roles', async () => {
    prisma.cotizacion.findUnique.mockResolvedValue(cotizacionRecord);
    const pdfBuffer = Buffer.from('%PDF-1.4 test pdf %%EOF', 'utf-8');
    pdfService.createCotizacionPdf.mockResolvedValue(pdfBuffer);

    const result = await service.generatePdf('cotizacion-1', baseUser);

    expect(pdfService.createCotizacionPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        numero: 'COT-1',
        includePrecios: true,
        subtotal: cotizacionRecord.subtotal,
        items: [
          expect.objectContaining({
            precioUnitario: cotizacionRecord.items[0].precioUnitario,
            subtotal: cotizacionRecord.items[0].subtotal,
          }),
        ],
      }),
    );

    const headers = result.getHeaders();
    expect(headers['Content-Type']).toBe('application/pdf');
    expect(headers['Content-Disposition']).toContain('cotizacion-COT-1.pdf');
  });

  it('omits pricing details when the user is a technician', async () => {
    prisma.cotizacion.findUnique.mockResolvedValue(cotizacionRecord);
    const pdfBuffer = Buffer.from('%PDF-1.4 test pdf %%EOF', 'utf-8');
    pdfService.createCotizacionPdf.mockResolvedValue(pdfBuffer);

    const tecnicoUser: CurrentUserData = {
      ...baseUser,
      rol: 'tecnico',
    };

    await service.generatePdf('cotizacion-1', tecnicoUser);

    expect(pdfService.createCotizacionPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        includePrecios: false,
        subtotal: null,
        impuestos: null,
        total: null,
        items: [expect.objectContaining({ precioUnitario: null, subtotal: null })],
      }),
    );
  });
});
