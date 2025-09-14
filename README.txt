ASSEM Panel — Vite + React + Tailwind
=====================================

Cómo usar
---------
1) Descomprime este proyecto.
2) En la carpeta, ejecuta:
   npm install
   npm run dev
3) Abre la URL que te muestra Vite (p.ej. http://localhost:5173).

Build para compartir
--------------------
npm run build
# Se genera la carpeta dist/
# Sube dist/ a Netlify / Vercel (static) o envíala como .zip

Notas
-----
- Esta versión replica el panel con React + Tailwind sin shadcn/ui para simplificar el export.
- Incluye: búsqueda, filtros rápidos (Responsable/Estado), paginación, crear proyecto (en memoria) y exportar CSV.
- Si quieres integrar tu versión exacta con shadcn/ui, usa tu repo y corre `npm run build` y despliega en Vercel.
