'use client';

import { useEffect, useState } from 'react';
import RecetaCard from '@/components/RecetaCard';
import { CATEGORIAS, TIPOS } from '@/components/RecetaForm';

interface Receta {
  id: number;
  nombre: string;
  porciones: number | null;
  categoria: string | null;
  tipo: string | null;
  creado_en: string;
}

export default function HomePage() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoActivo, setTipoActivo] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('/api/recetas')
      .then(r => r.json())
      .then(data => { setRecetas(data); setCargando(false); });
  }, []);

  const filtradas = recetas.filter(r => {
    const coincideBusqueda = r.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = !tipoActivo || r.tipo === tipoActivo;
    const coincideCategoria = !categoriaActiva || r.categoria === categoriaActiva;
    return coincideBusqueda && coincideTipo && coincideCategoria;
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Buscar receta..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <a
          href="/api/recetas/pdf"
          download="recetas.pdf"
          className="shrink-0 bg-gray-700 hover:bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          Descargar PDF
        </a>
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        {TIPOS.map(t => (
          <button
            key={t}
            onClick={() => setTipoActivo(prev => prev === t ? '' : t)}
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${tipoActivo === t ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setCategoriaActiva('')}
          className={`text-sm px-3 py-1 rounded-full border transition-colors ${categoriaActiva === '' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'}`}
        >
          Todas
        </button>
        {CATEGORIAS.map(c => (
          <button
            key={c}
            onClick={() => setCategoriaActiva(prev => prev === c ? '' : c)}
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${categoriaActiva === c ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {cargando && (
        <p className="text-gray-500 text-center py-12">Cargando...</p>
      )}

      {!cargando && filtradas.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          {busqueda || categoriaActiva ? 'No se encontraron recetas.' : 'No hay recetas aún. ¡Crea la primera!'}
        </div>
      )}

      <div className="space-y-3">
        {filtradas.map(r => (
          <RecetaCard key={r.id} {...r} />
        ))}
      </div>
    </div>
  );
}
