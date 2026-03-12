import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { auth } from '@/auth';

const ADMIN_EMAIL = 'acamacho@fullqueso.com';

interface Params { id: string }

export default async function RecetaDetallePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const session = await auth();
  const esAdmin = session?.user?.email === ADMIN_EMAIL;

  const [receta] = await sql`SELECT * FROM recetas WHERE id = ${id}`;
  if (!receta) notFound();

  const ingredientes = await sql`SELECT * FROM ingredientes WHERE receta_id = ${id}`;
  const pasos = await sql`SELECT * FROM pasos WHERE receta_id = ${id} ORDER BY orden`;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{receta.nombre}</h1>
            {receta.categoria && (
              <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                {receta.categoria}
              </span>
            )}
          </div>
          {receta.porciones && (
            <p className="text-gray-500 mt-1">{receta.porciones} porciones</p>
          )}
        </div>
        {esAdmin && (
          <Link
            href={`/recetas/${id}/editar`}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Editar
          </Link>
        )}
      </div>

      {ingredientes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Ingredientes</h2>
          <ul className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {ingredientes.map((ing: any) => (
              <li key={ing.id} className="px-4 py-3 flex justify-between text-sm">
                <span className="text-gray-900">{ing.nombre}</span>
                {(ing.cantidad || ing.unidad) && (
                  <span className="text-gray-500">
                    {ing.cantidad} {ing.unidad}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {pasos.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Preparación</h2>
          <ol className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {pasos.map((paso: any) => (
              <li key={paso.id} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {paso.orden}
                </span>
                <p className="text-gray-700 pt-0.5">{paso.descripcion}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {ingredientes.length === 0 && pasos.length === 0 && (
        <p className="text-gray-400 text-center py-8">Esta receta no tiene ingredientes ni pasos aún.</p>
      )}

      <div className="mt-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver a recetas
        </Link>
      </div>
    </div>
  );
}
