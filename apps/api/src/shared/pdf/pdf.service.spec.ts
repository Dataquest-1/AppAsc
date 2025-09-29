import { PdfService } from './pdf.service';

describe('PdfService', () => {
  const service = new PdfService();

  it('genera un PDF válido para una cotización', async () => {
    const buffer = await service.createCotizacionPdf({
      numero: 'COT-1',
      estado: 'borrador',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      cliente: { nombre: 'ACME' },
      activo: { nombre: 'Motor' },
      items: [
        {
          descripcion: 'Diagnóstico general',
          cantidad: 1,
          urgencia: 'media',
          precioUnitario: 50,
          subtotal: 50,
        },
      ],
      subtotal: 50,
      impuestos: 9.5,
      total: 59.5,
      includePrecios: true,
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.byteLength).toBeGreaterThan(0);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(buffer.includes(Buffer.from('%%EOF'))).toBe(true);
  });
});
