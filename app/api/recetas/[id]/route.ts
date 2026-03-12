import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [receta] = await sql`SELECT * FROM recetas WHERE id = ${id}`;
  if (!receta) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const ingredientes = await sql`SELECT * FROM ingredientes WHERE receta_id = ${id}`;
  const pasos = await sql`SELECT * FROM pasos WHERE receta_id = ${id} ORDER BY orden`;

  return NextResponse.json({ ...receta, ingredientes, pasos });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { nombre, porciones, ingredientes, pasos } = await req.json();

  if (!nombre?.trim()) {
    return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });
  }

  const [receta] = await sql`SELECT id FROM recetas WHERE id = ${id}`;
  if (!receta) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  await sql`
    UPDATE recetas
    SET nombre = ${nombre.trim()}, porciones = ${porciones || null}, actualizado_en = NOW()
    WHERE id = ${id}
  `;

  await sql`DELETE FROM ingredientes WHERE receta_id = ${id}`;
  await sql`DELETE FROM pasos WHERE receta_id = ${id}`;

  if (ingredientes?.length) {
    for (const ing of ingredientes) {
      await sql`
        INSERT INTO ingredientes (receta_id, nombre, cantidad, unidad)
        VALUES (${id}, ${ing.nombre}, ${ing.cantidad || null}, ${ing.unidad || null})
      `;
    }
  }

  if (pasos?.length) {
    for (let i = 0; i < pasos.length; i++) {
      await sql`
        INSERT INTO pasos (receta_id, orden, descripcion)
        VALUES (${id}, ${i + 1}, ${pasos[i].descripcion})
      `;
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [receta] = await sql`SELECT id FROM recetas WHERE id = ${id}`;
  if (!receta) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  await sql`DELETE FROM recetas WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
