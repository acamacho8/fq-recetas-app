'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const ADMIN_EMAIL = 'acamacho@fullqueso.com';

const CATEGORIA_COLORES: Record<string, string> = {
  Bebidas: 'bg-blue-100 text-blue-700',
  Helados: 'bg-purple-100 text-purple-700',
  Churros: 'bg-yellow-100 text-yellow-700',
  Topping: 'bg-green-100 text-green-700',
  Otras: 'bg-gray-100 text-gray-600',
};

interface Props {
  id: number;
  nombre: string;
  porciones: number | null;
  categoria: string | null;
  creado_en: string;
}

export default function RecetaCard({ id, nombre, porciones, categoria, creado_en }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const esAdmin = session?.user?.email === ADMIN_EMAIL;

  const eliminar = async () => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    await fetch(`/api/recetas/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/recetas/${id}`} className="text-lg font-semibold text-gray-900 hover:text-orange-600">
              {nombre}
            </Link>
            {categoria && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORIA_COLORES[categoria] ?? 'bg-gray-100 text-gray-600'}`}>
                {categoria}
              </span>
            )}
          </div>
          {porciones && (
            <p className="text-sm text-gray-500 mt-0.5">{porciones} porciones</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {new Date(creado_en).toLocaleDateString('es-VE')}
          </p>
        </div>
        {esAdmin && (
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/recetas/${id}/editar`}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Editar
            </Link>
            <button
              onClick={eliminar}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
