'use client';

export type Paso = { descripcion: string };

interface Props {
  pasos: Paso[];
  onChange: (pasos: Paso[]) => void;
}

export default function PasosEditor({ pasos, onChange }: Props) {
  const agregar = () => onChange([...pasos, { descripcion: '' }]);

  const actualizar = (i: number, valor: string) => {
    const copia = [...pasos];
    copia[i] = { descripcion: valor };
    onChange(copia);
  };

  const eliminar = (i: number) => onChange(pasos.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {pasos.map((paso, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="mt-2.5 text-sm font-bold text-gray-400 w-6 shrink-0">{i + 1}.</span>
          <textarea
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            placeholder={`Paso ${i + 1}`}
            rows={2}
            value={paso.descripcion}
            onChange={e => actualizar(i, e.target.value)}
          />
          <button
            type="button"
            onClick={() => eliminar(i)}
            className="mt-2 text-red-400 hover:text-red-600 text-lg leading-none px-1"
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
        + Agregar paso
      </button>
    </div>
  );
}
