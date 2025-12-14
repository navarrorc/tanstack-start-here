# Changelog

## 2025-12-12

- Dashboard sidebar no longer auto-collapses when selecting navigation items; state only changes via the menu toggle or mobile backdrop click. See `src/components/Sidebar.tsx`.
- Added cursor-pointer to all clickable elements for better user experience. See `src/components/ui/button.tsx`, `src/components/Sidebar.tsx`, `src/components/Header.tsx`, `src/routes/login.tsx`, `src/routes/index.tsx`, `src/lib/toast.tsx`.
- Changed "Hello World" text to "Hola Mundo" on the dashboard page. See `src/routes/dashboard/index.tsx`.
- Added Dashboard "Sections" navigation hub with horizontal tab bar and Marketplace scaffold experience. See `src/lib/sections.ts`, `src/routes/dashboard/index.tsx`, `src/routes/marketplace/_route.tsx`, `src/routes/marketplace/index.tsx`.
- Polished Marketplace category navigation bar styling and responsiveness; removed unwanted horizontal overflow; added subtle edge fades to hint at scrollability. See `src/routes/marketplace/index.tsx`.

## 2025-12-14

- **[Refactor]** Converted `dashboard` and `marketplace` routes to use standard `route.tsx` layouts, renaming from `_route.tsx` to fix context inheritance issues and navigation errors. Verified against TanStack Router conventions.

