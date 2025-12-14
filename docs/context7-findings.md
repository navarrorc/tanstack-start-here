# Context7 Findings: TanStack Router Layouts

The following excerpts were retrieved from TanStack Router documentation via Context7, clarifying the correct file naming conventions for directory layouts.

## 1. Directory Layouts (`routeToken`)

**Source**: `File-Based Routing API Reference > Configuration options > routeToken`

> The `routeToken` option is used to identify layout route files. A layout route renders its child routes within its own structure. Files named with this token (defaulting to `route`) will be treated as layout routes.
>
> **Example**:
> - `posts.route.tsx` or `posts/route.tsx` will resolve to `/posts`.
> - It acts as a wrapper for children (e.g., `posts/index.tsx`).

## 2. Pathless Routes (`_` prefix)

**Source**: `File Based Routing > Pathless Routes`

> Pathless routes enable wrapping child routes with custom logic or components without needing a specific URL path. these routes are identified by using an underscore `_` character in the filename.
>
> **Example**:
> - `_app.tsx` can serve as a layout without its own URL path.
> - `src/routes/marketplace/_route.tsx` (in our repo) likely creates a route ID `/marketplace/_route` which is a **sibling** to `/marketplace/` (index), typically used for internal grouping, not as a parent for the index unless explicitly configured.

## 3. Directory Structure Example

**Source**: `Routes > Layout Routes`

> A directory structure like `routes/app/` with files `route.tsx`, `dashboard.tsx`, and `settings.tsx` means `app/route.tsx` acts as a layout route, wrapping `app/dashboard.tsx` and `app/settings.tsx`.

---

**Conclusion**: To achieve a shared layout for `/dashboard` that wraps `/dashboard/index` and `/dashboard/users`, the file **must** be named `src/routes/dashboard/route.tsx`.
