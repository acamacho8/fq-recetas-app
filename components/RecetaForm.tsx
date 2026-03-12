'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import IngredientesEditor, { Ingrediente } from './IngredientesEditor';
import PasosEditor, { Paso } from './PasosEditor';

export const CATEGORIAS = ['Bebidas', 'Helados', 'Churros', 'Topping', 'Otras'];

interface Props {
  inicial?: {
    id?: number;
    nombre: string;
    porciones: string;
    categoria: string;
    ingredientes: Ingrediente[];
    pasos: Paso[];
  };
}

export default function RecetaForm({ inicial }: Props) {
  const router = useRouter();
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [porciones, setPorciones] = useState(inicial?.porciones ?? '');
  const [categoria, setCategoria] = useState(inicial?.categoria ?? '');
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>(inicial?.ingredientes ?? []);
  const [pasos, setPasos] = useState<Paso[]>(inicial?.pasos ?? []);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const esEdicion = !!inicial?.id;

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { setError('El nombre es requerido'); return; }
    setGuardando(true);
    setError('');

    const url = esEdicion ? `/api/recetas/${inicial.id}` : '/api/recetas';
    const method = esEdicion ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, porciones: porciones ? Number(porciones) : null, categoria: categoria || null, ingredientes, pasos }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Error al guardar');
      setGuardando(false);
      return;
    }

    if (esEdicion) {
      router.push(`/recetas/${inicial.id}`);
    } else {
      const data = await res.json();
      router.push(`/recetas/${data.id}`);
    }
    router.refresh();
  };

  return (
    <form onSubmit={guardar} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto *</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Arepa de Queso"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Porciones</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={porciones}
            onChange={e => setPorciones(e.target.value)}
            placeholder="Ej: 4"
            min={1}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
        >
          <option value="">Sin categoría</option>
          {CATEGORIAS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ingredientes</label>
        <IngredientesEditor ingredientes={ingredientes} onChange={setIngredientes} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pasos de preparación</label>
        <PasosEditor pasos={pasos} onChange={setPasos} />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={guardando}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium px-6 py-2 rounded transition-colors"
        >
          {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear receta'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-2 rounded transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
