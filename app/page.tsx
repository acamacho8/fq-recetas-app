'use client';

import { useEffect, useState } from 'react';
import RecetaCard from '@/components/RecetaCard';

interface Receta {
  id: number;
  nombre: string;
  porciones: number | null;
  creado_en: string;
}

export default function HomePage() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('/api/recetas')
      .then(r => r.json())
      .then(data => { setRecetas(data); setCargando(false); });
  }, []);

  const filtradas = recetas.filter(r =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Buscar receta..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {cargando && (
        <p className="text-gray-500 text-center py-12">Cargando...</p>
      )}

      {!cargando && filtradas.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          {busqueda ? `No se encontraron recetas para "${busqueda}"` : 'No hay recetas aún. ¡Crea la primera!'}
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
