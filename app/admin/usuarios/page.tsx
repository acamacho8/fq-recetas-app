'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  creado_en: string;
}

export default function AdminUsuariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const esAdmin = session?.user?.email === 'acamacho@fullqueso.com';

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { router.push('/login'); return; }
    cargarUsuarios();
  }, [session, status]);

  async function cargarUsuarios() {
    const res = await fetch('/api/usuarios');
    if (res.ok) setUsuarios(await res.json());
  }

  async function crearUsuario(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(''); setExito('');
    setCargando(true);
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password }),
    });
    setCargando(false);
    if (res.ok) {
      setExito('Usuario creado correctamente');
      setNombre(''); setEmail(''); setPassword('');
      cargarUsuarios();
    } else {
      const data = await res.json();
      setError(data.error || 'Error al crear usuario');
    }
  }

  async function eliminarUsuario(id: number, emailUsuario: string) {
    if (!confirm(`¿Eliminar a ${emailUsuario}?`)) return;
    await fetch('/api/usuarios', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    cargarUsuarios();
  }

  if (status === 'loading') return <p className="text-gray-500 text-center py-12">Cargando...</p>;

  if (!esAdmin) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No tienes permiso para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Gestión de usuarios</h1>

      {/* Formulario nuevo usuario */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Nuevo usuario</h2>
        <form onSubmit={crearUsuario} className="space-y-3">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {exito && <p className="text-green-600 text-sm">{exito}</p>}
          <button
            type="submit"
            disabled={cargando}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            {cargando ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Usuarios registrados</h2>
        {usuarios.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay usuarios.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {usuarios.map(u => (
              <li key={u.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{u.nombre}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                {u.email !== session?.user?.email && (
                  <button
                    onClick={() => eliminarUsuario(u.id, u.email)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
