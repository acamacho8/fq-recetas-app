# TODO: Gestor de Recetas de Productos
# Date: 2026-03-12

## Setup
- [ ] Crear proyecto Next.js: `npx create-next-app@latest recetas-app --typescript --tailwind --app`
- [ ] Instalar dependencia: `npm install @neondatabase/serverless`
- [ ] Copiar DATABASE_URL al `.env.local`
- [ ] Crear repo GitHub `fq-recetas-app` y hacer primer push
- [ ] Conectar repo a Vercel con variable DATABASE_URL

## Base de Datos
- [ ] Crear archivo `lib/db/schema.sql` con CREATE TABLE recetas, ingredientes, pasos
- [ ] Ejecutar schema en Neon (Neon console o psql)
- [ ] Crear cliente Neon en `lib/db.ts`

## API Routes
- [ ] `GET /api/recetas` — listar todas las recetas (id, nombre, porciones, creado_en)
- [ ] `POST /api/recetas` — crear receta + ingredientes + pasos en transacción
- [ ] `GET /api/recetas/[id]` — obtener receta completa con ingredientes y pasos
- [ ] `PUT /api/recetas/[id]` — actualizar (replace ingredientes y pasos)
- [ ] `DELETE /api/recetas/[id]` — eliminar receta (cascade en DB)

## Componentes
- [ ] `RecetaCard.tsx` — card con nombre, porciones, cantidad de ingredientes, botones Ver/Editar/Eliminar
- [ ] `IngredientesEditor.tsx` — lista dinámica: agregar fila, eliminar fila, campos nombre/cantidad/unidad
- [ ] `PasosEditor.tsx` — lista dinámica ordenada: agregar paso, eliminar, reordenar
- [ ] `RecetaForm.tsx` — formulario completo reutilizable (usa IngredientesEditor + PasosEditor)

## Páginas
- [ ] `app/page.tsx` — lista de recetas con buscador por nombre + botón "Nueva Receta"
- [ ] `app/recetas/nueva/page.tsx` — formulario crear (usa RecetaForm)
- [ ] `app/recetas/[id]/page.tsx` — vista detalle: nombre, porciones, ingredientes, pasos
- [ ] `app/recetas/[id]/editar/page.tsx` — formulario editar (precarga datos existentes)
- [ ] `app/layout.tsx` — layout con header "Recetas FQ" y navegación básica

## Business Logic
- [ ] Crear y actualizar receta en una sola transacción (receta + ingredientes + pasos)
- [ ] Al editar: eliminar ingredientes y pasos anteriores, insertar los nuevos
- [ ] Preservar orden de pasos con campo `orden`
- [ ] Validar que `nombre` no esté vacío antes de guardar

## Testing
- [ ] Crear "Arepa de Queso" con 3 ingredientes y 4 pasos → aparece en lista
- [ ] Editar nombre → cambio persiste al recargar
- [ ] Eliminar → desaparece de lista
- [ ] Buscar "arepa" → filtra correctamente
- [ ] Verificar en Neon console que no quedan registros huérfanos tras delete

## Polish
- [ ] Mensaje de confirmación antes de eliminar (confirm dialog)
- [ ] Loading states en botones de guardar
- [ ] Mensaje de error si falla la API
- [ ] `.env.example` con `DATABASE_URL=` vacío
- [ ] README.md con instrucciones de setup y deploy

## Delivery
- [ ] App funcionando en Vercel con URL pública
- [ ] CRUD completo probado con datos reales
- [ ] Comunicar URL a Francisco
