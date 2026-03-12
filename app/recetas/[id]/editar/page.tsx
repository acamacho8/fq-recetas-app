import { notFound, redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import RecetaForm from '@/components/RecetaForm';
import { auth } from '@/auth';

const ADMIN_EMAIL = 'acamacho@fullqueso.com';

interface Params { id: string }

export default async function EditarRecetaPage({ params }: { params: Promise<Params> }) {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) redirect('/');

  const { id } = await params;

  const [receta] = await sql`SELECT * FROM recetas WHERE id = ${id}`;
  if (!receta) notFound();

  const ingredientes = await sql`SELECT nombre, cantidad, unidad FROM ingredientes WHERE receta_id = ${id}`;
  const pasos = await sql`SELECT descripcion FROM pasos WHERE receta_id = ${id} ORDER BY orden`;

  const inicial = {
    id: receta.id,
    nombre: receta.nombre,
    porciones: receta.porciones?.toString() ?? '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ingredientes: ingredientes.map((i: any) => ({
      nombre: i.nombre,
      cantidad: i.cantidad?.toString() ?? '',
      unidad: i.unidad ?? '',
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pasos: pasos.map((p: any) => ({ descripcion: p.descripcion })),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar: {receta.nombre}</h1>
      <RecetaForm inicial={inicial} />
    </div>
  );
}
