# Recetas FQ — Guía para Claude

## Qué es este proyecto
App web interna de Full Queso para gestionar recetas de productos (ingredientes + pasos de preparación).
Solo el usuario administrador puede crear, editar o eliminar recetas. Todos los usuarios autenticados pueden consultarlas y descargar el PDF.

---

## Stack técnico
- **Framework**: Next.js 16 App Router + TypeScript
- **Base de datos**: Neon PostgreSQL (serverless) via `@neondatabase/serverless`
- **Auth**: NextAuth v5 beta (Credentials provider, JWT)
- **Estilos**: Tailwind CSS v4
- **PDF**: pdfkit (server-side, ruta `/api/recetas/pdf`)
- **Deploy**: Vercel (auto-deploy en push a `main`)
- **Repo**: https://github.com/acamacho8/fq-recetas-app

## Variables de entorno (`.env.local`)
```
DATABASE_URL=    # Neon PostgreSQL connection string
AUTH_SECRET=     # NextAuth secret
ADMIN_EMAIL=     # acamacho@fullqueso.com
```

---

## Estructura de archivos clave
```
app/
  page.tsx                        # Home: lista de recetas + búsqueda + filtros por categoría
  layout.tsx                      # Layout raíz con SessionProvider + Header
  login/page.tsx                  # Página de login
  admin/usuarios/page.tsx         # Gestión de usuarios (solo admin)
  recetas/
    nueva/page.tsx                # Crear receta
    [id]/page.tsx                 # Ver detalle de receta
    [id]/editar/page.tsx          # Editar receta (solo admin)
  api/
    auth/[...nextauth]/route.ts   # NextAuth handlers
    recetas/
      route.ts                    # GET lista, POST crear
      [id]/route.ts               # GET detalle, PUT editar, DELETE eliminar
      pdf/route.ts                # GET descarga PDF de todas las recetas
    usuarios/route.ts             # CRUD usuarios (solo admin)

components/
  Header.tsx                      # Navegación (muestra admin-only links si es admin)
  RecetaCard.tsx                  # Tarjeta de receta en lista (editar/eliminar solo admin)
  RecetaForm.tsx                  # Formulario crear/editar (exporta también CATEGORIAS[])
  IngredientesEditor.tsx          # Editor dinámico de ingredientes
  PasosEditor.tsx                 # Editor dinámico de pasos

lib/
  db.ts                           # Cliente Neon SQL
  db/schema.sql                   # Schema de la DB
```

---

## Base de datos — Tablas

### `recetas`
| columna | tipo | notas |
|---------|------|-------|
| id | SERIAL PK | |
| nombre | VARCHAR(255) | requerido |
| porciones | INTEGER | nullable |
| categoria | VARCHAR(100) | nullable — ver categorías abajo |
| creado_en | TIMESTAMP | default NOW() |
| actualizado_en | TIMESTAMP | |

### `ingredientes`
| columna | tipo |
|---------|------|
| id | SERIAL PK |
| receta_id | FK → recetas.id |
| nombre | VARCHAR(255) |
| cantidad | DECIMAL |
| unidad | VARCHAR(50) |

### `pasos`
| columna | tipo |
|---------|------|
| id | SERIAL PK |
| receta_id | FK → recetas.id |
| orden | INTEGER |
| descripcion | TEXT |

### `usuarios`
| columna | tipo |
|---------|------|
| id | SERIAL PK |
| nombre | VARCHAR(255) |
| email | VARCHAR(255) UNIQUE |
| password_hash | VARCHAR(255) |
| creado_en | TIMESTAMP |

---

## Categorías de recetas
Definidas en `components/RecetaForm.tsx` → `export const CATEGORIAS`:
```
['Bebidas', 'Helados', 'Churros', 'Topping', 'Otras']
```
Para agregar una categoría nueva, editar ese array. El PDF y los filtros se actualizan automáticamente.

**Colores por categoría** (usados en UI y PDF):
- Bebidas → azul
- Helados → morado
- Churros → amarillo
- Topping → verde
- Otras / Sin categoría → gris

---

## Lógica de autorización
- **Admin**: `acamacho@fullqueso.com` (hardcodeado en cada archivo que lo necesita como `ADMIN_EMAIL`)
- **Qué puede hacer solo el admin**: crear, editar, eliminar recetas; gestionar usuarios
- **Qué puede hacer cualquier usuario autenticado**: ver recetas, descargar PDF
- **Protección**: doble capa — UI oculta los botones + API devuelve 403 si no es admin

## Archivos que contienen `ADMIN_EMAIL`
- `components/Header.tsx`
- `components/RecetaCard.tsx`
- `app/recetas/[id]/page.tsx`
- `app/recetas/[id]/editar/page.tsx`
- `app/api/recetas/[id]/route.ts`
- `app/admin/usuarios/page.tsx`
- `app/api/usuarios/route.ts`

---

## PDF (`/api/recetas/pdf`)
- Generado server-side con `pdfkit`
- Requiere `serverExternalPackages: ['pdfkit']` en `next.config.ts` (para Vercel)
- Organizado por categorías (encabezado de sección con color + etiqueta membrete en cada receta)
- Orden de secciones: Bebidas → Helados → Churros → Topping → Otras → Sin categoría
- Accesible para cualquier usuario autenticado

---

## Comandos útiles
```bash
# Desarrollo local
npm run dev          # http://localhost:3000

# Build
npm run build

# Migración manual en Neon (ejemplo)
node -e "
  const { neon } = require('@neondatabase/serverless');
  const env = require('fs').readFileSync('.env.local', 'utf8');
  const url = env.match(/DATABASE_URL=(.+)/)?.[1]?.trim();
  const sql = neon(url);
  sql\`ALTER TABLE recetas ADD COLUMN ...\`.then(console.log);
"
```

---

## Pendiente / posibles mejoras
- Agregar más categorías si se necesitan (editar `CATEGORIAS` en `RecetaForm.tsx`)
- Imágenes por receta (actualmente no hay campo de imagen)
- Búsqueda server-side para datasets grandes
- Posibilidad de que otros usuarios (no solo admin) creen recetas
