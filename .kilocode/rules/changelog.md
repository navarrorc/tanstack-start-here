# Changelog Standards

**Rule**: Upon completion of any bug fix, refactor, or new feature, you **MUST** update `docs/CHANGELOG.md`.

## Workflow
1.  Complete the coding task.
2.  Before marking the task as "Finished", append a new entry to `docs/CHANGELOG.md`.
3.  Use the current date (YYYY-MM-DD) as the header if it doesn't exist.

## Format
```markdown
## YYYY-MM-DD

- **[Category]** Description of change. (Reference files if helpful).
```

### Categories
-   **[Feature]**: New capabilities.
-   **[Fix]**: Bug fixes.
-   **[Refactor]**: Code restructuring (like the route changes).
-   **[Docs]**: Documentation updates.

## Example
```markdown
## 2025-12-14

- **[Refactor]** Converted `dashboard` and `marketplace` routes to use standard `route.tsx` layouts, renaming from `_route.tsx` to fix context inheritance and 404 errors.
```