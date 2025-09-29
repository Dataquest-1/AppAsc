import * as apiModule from './api';

describe('cotizacionesAPI.generatePDF', () => {
  it('invoca la descarga del PDF con la ruta correcta', async () => {
    const downloadSpy = jest.spyOn(apiModule.api, 'download').mockResolvedValue();

    await apiModule.cotizacionesAPI.generatePDF('cotizacion-1');

    expect(downloadSpy).toHaveBeenCalledWith(
      '/cotizaciones/cotizacion-1/pdf',
      'cotizacion-cotizacion-1.pdf',
    );

    downloadSpy.mockRestore();
  });
});
