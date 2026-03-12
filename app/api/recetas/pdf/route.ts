import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import PDFDocument from 'pdfkit';

const CATEGORIA_COLORES: Record<string, string> = {
  Bebidas:      '#3b82f6',
  Helados:      '#a855f7',
  Churros:      '#f59e0b',
  Topping:      '#22c55e',
  Otras:        '#6b7280',
  'Sin categoría': '#d1d5db',
};

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

  const ordenFinal = [
    ...ORDEN_CATEGORIAS.filter(c => grupos[c]),
    ...Object.keys(grupos).filter(c => !ORDEN_CATEGORIAS.includes(c) && c !== 'Sin categoría'),
    ...(grupos['Sin categoría'] ? ['Sin categoría'] : []),
  ];

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  // Encabezado principal
  doc.fontSize(26).font('Helvetica-Bold').fillColor('#e97a20').text('Recetas FQ', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica').fillColor('#999999').text(
    `${recetas.length} receta${recetas.length !== 1 ? 's' : ''} · ${new Date().toLocaleDateString('es-VE')}`,
    { align: 'center' }
  );
  doc.moveDown(1.5);

  let primeraCategoria = true;

  for (const categoria of ordenFinal) {
    const lista = grupos[categoria];
    const colorCat = CATEGORIA_COLORES[categoria] ?? '#6b7280';

    if (!primeraCategoria) doc.moveDown(1.5);
    primeraCategoria = false;

    // ── Encabezado de sección ──────────────────────────────────────
    const secY = doc.y;
    doc.rect(50, secY, 495, 26).fill(colorCat);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#ffffff')
      .text(`  ${categoria.toUpperCase()}  (${lista.length} receta${lista.length !== 1 ? 's' : ''})`,
        54, secY + 7);
    doc.moveDown(1.2);

    // ── Recetas de esta sección ────────────────────────────────────
    for (let i = 0; i < lista.length; i++) {
      const r = lista[i];

      if (i > 0) {
        doc.moveDown(0.6);
        doc.moveTo(60, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
        doc.moveDown(0.6);
      }

      // Barra lateral de color + nombre de receta
      const recetaY = doc.y;
      doc.rect(50, recetaY, 4, 18).fill(colorCat);
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#111827')
        .text(r.nombre, 62, recetaY);

      // Etiqueta membrete de categoría (tag naranja/color junto al nombre)
      const nombreAncho = doc.widthOfString(r.nombre);
      const tagX = 62 + nombreAncho + 8;
      const tagW = doc.widthOfString(categoria) + 12;
      if (tagX + tagW < 530) {
        doc.rect(tagX, recetaY + 1, tagW, 14).fill(colorCat);
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff')
          .text(categoria, tagX + 6, recetaY + 3.5);
      }

      if (r.porciones) {
        doc.fontSize(9).font('Helvetica').fillColor('#9ca3af')
          .text(`${r.porciones} porciones`, 62, doc.y + 2);
      }

      doc.moveDown(0.5);

      // Ingredientes
      if (r.ingredientes?.length > 0) {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151').text('Ingredientes', 62);
        doc.moveDown(0.15);
        for (const ing of r.ingredientes) {
          const detalle = [ing.cantidad, ing.unidad].filter(Boolean).join(' ');
          const linea = detalle ? `${ing.nombre}  —  ${detalle}` : ing.nombre;
          doc.fontSize(9).font('Helvetica').fillColor('#4b5563').text(`• ${linea}`, { indent: 72 });
        }
        doc.moveDown(0.3);
      }

      // Pasos
      if (r.pasos?.length > 0) {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151').text('Preparación', 62);
        doc.moveDown(0.15);
        for (const paso of r.pasos) {
          doc.fontSize(9).font('Helvetica').fillColor('#4b5563')
            .text(`${paso.orden}.  ${paso.descripcion}`, { indent: 72 });
          doc.moveDown(0.1);
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
