import { Injectable } from '@nestjs/common';

export interface CotizacionPdfData {
  numero?: string | null;
  estado?: string | null;
  createdAt?: Date | string | null;
  cliente?: {
    nombre?: string | null;
    email?: string | null;
    telefono?: string | null;
  } | null;
  activo?: {
    nombre?: string | null;
    codigo?: string | null;
  } | null;
  items: Array<{
    descripcion?: string | null;
    cantidad?: number | null;
    urgencia?: string | null;
    precioUnitario?: number | null;
    subtotal?: number | null;
  }>;
  subtotal?: number | null;
  impuestos?: number | null;
  total?: number | null;
  includePrecios: boolean;
}

@Injectable()
export class PdfService {
  async createCotizacionPdf(data: CotizacionPdfData): Promise<Buffer> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const endPromise = new Promise<void>((resolve) => {
      doc.on('end', () => resolve());
    });

    const title = data.numero ? `Cotización ${data.numero}` : 'Cotización';
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    if (data.estado) {
      doc.text(`Estado: ${this.capitalize(data.estado)}`);
    }

    if (data.createdAt) {
      const date = this.formatDate(data.createdAt);
      doc.text(`Fecha de creación: ${date}`);
    }

    if (data.cliente) {
      doc.text(`Cliente: ${data.cliente.nombre ?? 'N/A'}`);
      if (data.cliente.email) {
        doc.text(`Email: ${data.cliente.email}`);
      }
      if (data.cliente.telefono) {
        doc.text(`Teléfono: ${data.cliente.telefono}`);
      }
    }

    if (data.activo) {
      doc.text(`Activo: ${data.activo.nombre ?? 'N/A'}`);
      if (data.activo.codigo) {
        doc.text(`Código del activo: ${data.activo.codigo}`);
      }
    }

    doc.moveDown();
    doc.fontSize(14).text('Detalle de items', { underline: true });
    doc.moveDown(0.5);

    if (!data.items.length) {
      doc.fontSize(12).text('No hay items registrados.');
    }

    data.items.forEach((item, index) => {
      doc.fontSize(12).text(`${index + 1}. ${item.descripcion ?? 'Item sin descripción'}`);
      if (item.cantidad !== undefined && item.cantidad !== null) {
        doc.fontSize(10).text(`Cantidad: ${item.cantidad}`);
      }
      if (item.urgencia) {
        doc.fontSize(10).text(`Urgencia: ${this.capitalize(item.urgencia)}`);
      }
      if (data.includePrecios) {
        if (item.precioUnitario !== undefined && item.precioUnitario !== null) {
          doc.fontSize(10).text(`Precio unitario: ${this.formatCurrency(item.precioUnitario)}`);
        }
        if (item.subtotal !== undefined && item.subtotal !== null) {
          doc.fontSize(10).text(`Subtotal: ${this.formatCurrency(item.subtotal)}`);
        }
      }
      doc.moveDown(0.5);
    });

    if (data.includePrecios) {
      doc.moveDown();
      doc.fontSize(14).text('Totales', { underline: true });
      if (data.subtotal !== undefined && data.subtotal !== null) {
        doc.fontSize(12).text(`Subtotal: ${this.formatCurrency(data.subtotal)}`);
      }
      if (data.impuestos !== undefined && data.impuestos !== null) {
        doc.fontSize(12).text(`Impuestos: ${this.formatCurrency(data.impuestos)}`);
      }
      if (data.total !== undefined && data.total !== null) {
        doc.fontSize(12).text(`Total: ${this.formatCurrency(data.total)}`);
      }
    }

    doc.end();
    await endPromise;

    return Buffer.concat(chunks);
  }

  private capitalize(value: string): string {
    if (!value) {
      return value;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private formatDate(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleDateString('es-ES');
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  }
}
