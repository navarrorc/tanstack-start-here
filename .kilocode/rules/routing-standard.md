# TanStack Routing Standard

## Guidelines for Directory Routes (Layouts)

When a route segment has child routes (like `/dashboard/index` and `/dashboard/users`) and needs a shared layout or auth guard:

1.  **Use `routes/<section>/route.tsx`**
    -   This acts as the **Parent Layout** for the directory.
    -   It must render `<Outlet />`.
    -   Example: `routes/dashboard/route.tsx` Wraps `routes/dashboard/index.tsx`.

2.  **Use `routes/<section>/index.tsx`**
    -   This is the default child route (e.g., `/dashboard/`).

## File Naming Conventions

-   **`route.tsx`**: Directory Layout (Parent). Use this when you need to nest children under a common UI/Guard.
-   **`index.tsx`**: Directory Index (Child).
-   **`_route.tsx`**: Pathless/Sibling Route. **Avoid** for standard directory layouts as it creates a sibling relationship, breaking context inheritance from the "parent".
