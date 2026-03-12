import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import PDFDocument from 'pdfkit';

const ORDEN_CATEGORIAS = ['Bebidas', 'Helados', 'Churros', 'Topping', 'Otras'];

export async function GET() {
  const recetas = await sql`SELECT * FROM recetas ORDER BY nombre`;

  for (const receta of recetas) {
    receta.ingredientes = await sql`SELECT * FROM ingredientes WHERE receta_id = ${receta.id}`;
    receta.pasos = await sql`SELECT * FROM pasos WHERE receta_id = ${receta.id} ORDER BY orden`;
  }

  // Agrupar por categoría
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const grupos: Record<string, any[]> = {};
  for (const r of recetas) {
    const cat = (r.categoria as string) || 'Sin categoría';
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(r);
  }

  // Orden: categorías definidas primero, luego "Otras", luego "Sin categoría"
  const ordenFinal = [
    ...ORDEN_CATEGORIAS.filter(c => grupos[c]),
    ...Object.keys(grupos).filter(c => !ORDEN_CATEGORIAS.includes(c) && c !== 'Sin categoría'),
    ...(grupos['Sin categoría'] ? ['Sin categoría'] : []),
  ];

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  // Portada
  doc.fontSize(28).font('Helvetica-Bold').fillColor('#e97a20').text('Recetas FQ', { align: 'center' });
  doc.moveDown(0.4);
  doc.fontSize(10).font('Helvetica').fillColor('#888888').text(
    `${recetas.length} receta${recetas.length !== 1 ? 's' : ''} · ${new Date().toLocaleDateString('es-VE')}`,
    { align: 'center' }
  );
  doc.moveDown(2);

  let primeraCategoria = true;

  for (const categoria of ordenFinal) {
    const lista = grupos[categoria];

    // Separador entre categorías (no antes de la primera)
    if (!primeraCategoria) {
      doc.moveDown(1.5);
    }
    primeraCategoria = false;

    // Encabezado de categoría
    doc.rect(50, doc.y, 495, 24).fill('#e97a20');
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#ffffff')
      .text(categoria.toUpperCase(), 58, doc.y - 19);
    doc.moveDown(1);

    // Recetas de esta categoría
    for (let i = 0; i < lista.length; i++) {
      const r = lista[i];

      if (i > 0) {
        doc.moveDown(0.8);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#eeeeee').lineWidth(0.5).stroke();
        doc.moveDown(0.8);
      }

      // Nombre de receta
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a1a1a').text(r.nombre);

      if (r.porciones) {
        doc.fontSize(10).font('Helvetica').fillColor('#888888').text(`${r.porciones} porciones`);
      }

      doc.moveDown(0.4);

      // Ingredientes
      if (r.ingredientes?.length > 0) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#555555').text('Ingredientes');
        doc.moveDown(0.2);
        for (const ing of r.ingredientes) {
          const detalle = [ing.cantidad, ing.unidad].filter(Boolean).join(' ');
          const linea = detalle ? `${ing.nombre}  —  ${detalle}` : ing.nombre;
          doc.fontSize(10).font('Helvetica').fillColor('#333333').text(`• ${linea}`, { indent: 12 });
        }
        doc.moveDown(0.4);
      }

      // Pasos
      if (r.pasos?.length > 0) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#555555').text('Preparación');
        doc.moveDown(0.2);
        for (const paso of r.pasos) {
          doc.fontSize(10).font('Helvetica').fillColor('#333333')
            .text(`${paso.orden}.  ${paso.descripcion}`, { indent: 12 });
          doc.moveDown(0.15);
        }
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
