import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import PDFDocument from 'pdfkit';

export async function GET() {
  const recetas = await sql`SELECT * FROM recetas ORDER BY nombre`;

  for (const receta of recetas) {
    receta.ingredientes = await sql`SELECT * FROM ingredientes WHERE receta_id = ${receta.id}`;
    receta.pasos = await sql`SELECT * FROM pasos WHERE receta_id = ${receta.id} ORDER BY orden`;
  }

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  // Header
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#e97a20').text('Recetas FQ', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#888888').text(
    `${recetas.length} receta${recetas.length !== 1 ? 's' : ''} · ${new Date().toLocaleDateString('es-VE')}`,
    { align: 'center' }
  );
  doc.moveDown(1.5);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (let i = 0; i < recetas.length; i++) {
    const r = recetas[i] as any;

    if (i > 0) {
      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#dddddd').lineWidth(1).stroke();
      doc.moveDown(1);
    }

    // Recipe name
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1a1a1a').text(r.nombre);

    if (r.porciones) {
      doc.fontSize(10).font('Helvetica').fillColor('#666666').text(`${r.porciones} porciones`);
    }

    doc.moveDown(0.5);

    // Ingredientes
    if (r.ingredientes?.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#444444').text('Ingredientes');
      doc.moveDown(0.3);
      for (const ing of r.ingredientes) {
        const detalle = [ing.cantidad, ing.unidad].filter(Boolean).join(' ');
        const linea = detalle ? `${ing.nombre}  —  ${detalle}` : ing.nombre;
        doc.fontSize(10).font('Helvetica').fillColor('#333333').text(`• ${linea}`, { indent: 10 });
      }
      doc.moveDown(0.5);
    }

    // Pasos
    if (r.pasos?.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#444444').text('Preparación');
      doc.moveDown(0.3);
      for (const paso of r.pasos) {
        doc.fontSize(10).font('Helvetica').fillColor('#333333')
          .text(`${paso.orden}.  ${paso.descripcion}`, { indent: 10 });
        doc.moveDown(0.2);
      }
    }
  }

  doc.end();

  const buffer = await new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="recetas.pdf"',
    },
  });
}
