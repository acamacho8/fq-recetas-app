# Spec: Gestor de Recetas de Productos
# Date: 2026-03-12
# Status: Ready for implementation

## Problema
Full Queso necesita un sistema para crear, ver, editar y eliminar recetas de productos.
Actualmente no existe ningún registro digital de recetas. Esta app centraliza esa información
con ingredientes, cantidades y pasos de preparación.

## Stack Decision
- **Framework:** Next.js 14 App Router (TypeScript)
- **Base de datos:** Neon PostgreSQL (misma instancia que mi-proyecto)
- **ORM:** Consultas SQL directas con `@neondatabase/serverless`
- **Estilos:** Tailwind CSS
- **Deploy:** Vercel (auto-deploy desde GitHub)
- **Rationale:** Stack idéntico al de mi-proyecto — sin curva de aprendizaje, reutiliza Neon DB existente.

## Project Path
~/Documents/FQ-Apps/recetas-app/

## Input
- Usuario ingresa recetas manualmente a través de formularios web
- Campos por receta:
  - Nombre del producto (texto)
  - Porciones (número, opcional)
  - Ingredientes: lista dinámica de { nombre, cantidad, unidad }
  - Pasos: lista dinámica de instrucciones ordenadas

## Output
- App web CRUD completa, accesible desde cualquier dispositivo
- Datos persistidos en Neon PostgreSQL
- URL pública en Vercel

## Modelo de Datos

```sql
CREATE TABLE recetas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  porciones INTEGER,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ingredientes (
  id SERIAL PRIMARY KEY,
  receta_id INTEGER REFERENCES recetas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10,2),
  unidad VARCHAR(50)
);

CREATE TABLE pasos (
  id SERIAL PRIMARY KEY,
  receta_id INTEGER REFERENCES recetas(id) ON DELETE CASCADE,
  orden INTEGER NOT NULL,
  descripcion TEXT NOT NULL
);
```

## Páginas y Rutas

| Ruta | Componente | Función |
|---|---|---|
| `/` | `page.tsx` | Lista de recetas con buscador por nombre |
| `/recetas/nueva` | `nueva/page.tsx` | Formulario para crear receta |
| `/recetas/[id]` | `[id]/page.tsx` | Vista detalle de receta |
| `/recetas/[id]/editar` | `[id]/editar/page.tsx` | Formulario para editar receta |

## API Routes

| Endpoint | Método | Función |
|---|---|---|
| `/api/recetas` | GET | Listar todas las recetas |
| `/api/recetas` | POST | Crear receta (con ingredientes y pasos) |
| `/api/recetas/[id]` | GET | Obtener receta completa |
| `/api/recetas/[id]` | PUT | Actualizar receta |
| `/api/recetas/[id]` | DELETE | Eliminar receta |

## Logic / Steps

1. Crear tablas en Neon (script SQL en `lib/db/schema.sql`)
2. Crear cliente Neon en `lib/db.ts`
3. Implementar API Routes con operaciones CRUD
4. Implementar página de lista con buscador (client-side filter)
5. Implementar formulario dinámico (agregar/quitar ingredientes y pasos)
6. Implementar página de detalle
7. Conectar formulario de edición con datos existentes
8. Deploy a Vercel con DATABASE_URL

## Business Rules
- Al eliminar una receta, se eliminan en cascada sus ingredientes y pasos
- Los ingredientes y pasos se guardan en la misma transacción que la receta
- El orden de los pasos se preserva (campo `orden`)
- Nombre de receta es obligatorio; porciones e ingredientes son opcionales

## Edge Cases
- Receta sin ingredientes: permitido
- Receta sin pasos: permitido
- Búsqueda vacía: muestra todas las recetas
- Receta inexistente (`/recetas/999`): mostrar página 404
- Error de DB: mostrar mensaje de error claro al usuario

## File Structure
```
recetas-app/
├── app/
│   ├── page.tsx                    ← Lista + buscador
│   ├── layout.tsx                  ← Layout global
│   ├── globals.css
│   ├── recetas/
│   │   ├── nueva/
│   │   │   └── page.tsx            ← Formulario crear
│   │   └── [id]/
│   │       ├── page.tsx            ← Vista detalle
│   │       └── editar/
│   │           └── page.tsx        ← Formulario editar
│   └── api/
│       └── recetas/
│           ├── route.ts            ← GET lista, POST crear
│           └── [id]/
│               └── route.ts        ← GET, PUT, DELETE por id
├── lib/
│   ├── db.ts                       ← Cliente Neon
│   └── db/
│       └── schema.sql              ← Script creación de tablas
├── components/
│   ├── RecetaCard.tsx              ← Card para lista
│   ├── RecetaForm.tsx              ← Formulario reutilizable (crear/editar)
│   └── IngredientesEditor.tsx      ← Lista dinámica de ingredientes
├── .env.local                      ← DATABASE_URL (no commitear)
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── docs/
    ├── spec_recetas.md
    └── todo_recetas.md
```

## Testing Plan
- Crear receta "Arepa de Queso" con 3 ingredientes y 4 pasos → verificar que aparece en lista
- Editar nombre → verificar que el cambio persiste
- Eliminar receta → verificar que desaparece de la lista y no quedan registros huérfanos en DB
- Buscar por nombre parcial → verificar que el filtro funciona
