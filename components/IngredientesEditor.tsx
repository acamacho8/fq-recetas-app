'use client';

export type Ingrediente = { nombre: string; cantidad: string; unidad: string };

interface Props {
  ingredientes: Ingrediente[];
  onChange: (ingredientes: Ingrediente[]) => void;
}

export default function IngredientesEditor({ ingredientes, onChange }: Props) {
  const agregar = () => onChange([...ingredientes, { nombre: '', cantidad: '', unidad: '' }]);

  const actualizar = (i: number, campo: keyof Ingrediente, valor: string) => {
    const copia = [...ingredientes];
    copia[i] = { ...copia[i], [campo]: valor };
    onChange(copia);
  };

  const eliminar = (i: number) => onChange(ingredientes.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {ingredientes.map((ing, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Ingrediente"
            value={ing.nombre}
            onChange={e => actualizar(i, 'nombre', e.target.value)}
          />
          <input
            className="w-24 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Cantidad"
            value={ing.cantidad}
            onChange={e => actualizar(i, 'cantidad', e.target.value)}
          />
          <input
            className="w-20 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Unidad"
            value={ing.unidad}
            onChange={e => actualizar(i, 'unidad', e.target.value)}
          />
          <button
            type="button"
            onClick={() => eliminar(i)}
            className="text-red-400 hover:text-red-600 text-lg leading-none px-1"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={agregar}
        className="text-sm text-orange-600 hover:text-orange-800 font-medium"
      >
        + Agregar ingrediente
      </button>
    </div>
  );
}
