import { StreamableFile } from '@nestjs/common';
import { CotizacionesController } from './cotizaciones.controller';
import { CotizacionesService } from './cotizaciones.service';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';

describe('CotizacionesController', () => {
  let controller: CotizacionesController;
  let service: { generatePdf: jest.Mock };

  const user: CurrentUserData = {
    id: 'user-1',
    username: 'user',
    email: 'user@example.com',
    nombre: 'Usuario',
    apellido: 'Prueba',
    rol: 'admin',
    empresaId: 'empresa-1',
    empresaCodigo: 'EMP-1',
  };

  beforeEach(() => {
    service = {
      generatePdf: jest.fn(),
    };

    controller = new CotizacionesController(service as unknown as CotizacionesService);
  });

  it('should delegate PDF generation to the service', async () => {
    const stream = new StreamableFile(Buffer.from('pdf'));
    service.generatePdf.mockResolvedValue(stream);

    const result = await controller.downloadPdf('cotizacion-1', user);

    expect(service.generatePdf).toHaveBeenCalledWith('cotizacion-1', user);
    expect(result).toBe(stream);
  });
});
