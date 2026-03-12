import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  const recetas = await sql`
    SELECT id, nombre, porciones, categoria, creado_en
    FROM recetas
    ORDER BY creado_en DESC
  `;
  return NextResponse.json(recetas);
}

export async function POST(req: NextRequest) {
  const { nombre, porciones, categoria, ingredientes, pasos } = await req.json();

  if (!nombre?.trim()) {
    return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });
  }

  const [receta] = await sql`
    INSERT INTO recetas (nombre, porciones, categoria)
    VALUES (${nombre.trim()}, ${porciones || null}, ${categoria || null})
    RETURNING id
  `;

  if (ingredientes?.length) {
    for (const ing of ingredientes) {
      await sql`
        INSERT INTO ingredientes (receta_id, nombre, cantidad, unidad)
        VALUES (${receta.id}, ${ing.nombre}, ${ing.cantidad || null}, ${ing.unidad || null})
      `;
    }
  }

  if (pasos?.length) {
    for (let i = 0; i < pasos.length; i++) {
      await sql`
        INSERT INTO pasos (receta_id, orden, descripcion)
        VALUES (${receta.id}, ${i + 1}, ${pasos[i].descripcion})
      `;
    }
  }

  return NextResponse.json({ id: receta.id }, { status: 201 });
}
