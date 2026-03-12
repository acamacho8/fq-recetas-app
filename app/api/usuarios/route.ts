import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const usuarios = await sql`SELECT id, nombre, email, creado_en FROM usuarios ORDER BY creado_en DESC`;
  return NextResponse.json(usuarios);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  if (session.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Solo el administrador puede crear usuarios' }, { status: 403 });
  }

  const { nombre, email, password } = await req.json();
  if (!nombre || !email || !password) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM usuarios WHERE email = ${email}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 10);
  await sql`INSERT INTO usuarios (nombre, email, password_hash) VALUES (${nombre}, ${email}, ${password_hash})`;

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  if (session.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Solo el administrador puede eliminar usuarios' }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  await sql`DELETE FROM usuarios WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
