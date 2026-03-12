'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

const ADMIN_EMAIL = 'acamacho@fullqueso.com';

export default function Header() {
  const { data: session } = useSession();
  const esAdmin = session?.user?.email === ADMIN_EMAIL;

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-orange-500">
          Recetas FQ
        </Link>
        <div className="flex items-center gap-3">
          {esAdmin && (
            <Link
              href="/admin/usuarios"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Usuarios
            </Link>
          )}
          <Link
            href="/recetas/nueva"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            + Nueva receta
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
