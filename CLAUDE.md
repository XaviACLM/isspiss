# CLAUDE.md

Hey Claude. This is the ISS Piss project. Read `project_structure.md` for the full specification.

## Quick Summary

Website at isspiss.com that displays when astronauts are urinating on the ISS, based on NASA telemetry of the urine tank level.

- **Frontend**: React + TypeScript + Tailwind + Vite
- **Backend**: Cloudflare Workers + Durable Objects (Phase 2)
- **Communication**: Server-Sent Events (SSE)

Currently working on: **Phase 1 (Frontend)** with mock backend.

## Coding Style Guidelines

### TypeScript
- Strict mode enabled
- Prefer `interface` over `type` for object shapes
- Use explicit return types on exported functions
- No `any` unless absolutely necessary (and comment why)

### React
- Functional components only
- Prefer hooks over other patterns
- Keep components small and focused
- Colocate component-specific styles/logic

### Tailwind
- Use Tailwind classes directly in JSX
- Extract repeated patterns into components, not @apply
- Keep class lists readable (line breaks for long lists)

### General
- No unused imports or variables
- Descriptive variable names; avoid abbreviations except obvious ones (e.g., `idx`, `evt`)
- Comments for "why", not "what"
- Keep files under ~200 lines where reasonable

## File Naming

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils/services: `camelCase.ts`
- Types: `index.ts` in types folder, or colocated

## Testing

To be decided when it becomes relevant, but likely no testing will be necessary considering the minimal scale of the project.

## Important Notes

- The mock event source (`mockEventSource.ts`) should implement the same interface as the real one (`pissEventSource.ts`) so swapping is seamless
- The "excessive ads" mode is a feature, not a bug
- Keep the humor deadpan in the UI - no winking at the camera
