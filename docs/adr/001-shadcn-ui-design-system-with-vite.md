# ADR-001: shadcn/ui Design System with Vite Build

**Status**: Accepted

**Date**: 2025-11-09

**Deciders**: Development Team

**Related ADRs**:

- Related to: [ADR-000](000-use-architecture-decision-records.md)

---

## Context and Problem Statement

The SkillSwap platform requires a UI component library for the frontend application. The architecture specifies a separate `design-system` package in the monorepo to house reusable components. Requirements include:

- Consistent UI components across the application
- Support for internationalization (FR/EN)
- Theming capability for potential white-labeling
- TypeScript support with strong typing
- Fast development experience with HMR
- Accessibility compliance (WCAG 2.1 AA minimum)

The design-system package was created with `tsup` as the build tool, but we need to decide:

1. Which component library to use
2. Whether to keep `tsup` or switch to `Vite` for consistency

## Decision Drivers

- **Developer Experience**: Team already uses Vite for frontend, minimizing context switching
- **Component Quality**: Need production-ready, accessible components
- **Customization**: Must support theming and styling customization
- **Maintenance**: Prefer lower maintenance burden over custom components
- **TypeScript**: First-class TypeScript support required
- **Bundle Consistency**: Using same bundler across packages simplifies build pipeline
- **CSS Handling**: Need proper Tailwind CSS + PostCSS integration
- **Cost**: Free and open-source preferred for MVP

## Considered Options

### Option 1: shadcn/ui with Vite

**Description**: Use shadcn/ui component library (built on Radix UI + Tailwind CSS) with Vite as the build tool for the design-system package.

**Pros**:

- Copy components into codebase (full ownership, no version lock-in)
- Built on Radix UI (excellent accessibility)
- Tailwind CSS integration (matches project CSS framework)
- Vite consistency with frontend package
- CSS extraction handled properly by Vite
- TypeScript first-class support
- Free and open source
- Active community and regular updates
- Easy to customize (components are in your codebase)

**Cons**:

- Vite library mode requires slightly more config than tsup (~10 lines)
- Need `vite-plugin-dts` for declaration files
- Components copied in (not npm installed), requires updates manually

**Estimated Effort**: Low (2-3 hours setup)

**Cost**: Free

---

### Option 2: shadcn/ui with tsup (Current Setup)

**Description**: Keep existing tsup setup, add shadcn/ui components.

**Pros**:

- tsup is purpose-built for library bundling (simpler config)
- Faster builds (esbuild-based)
- Zero-config dual format (CJS + ESM) generation

**Cons**:

- Different tool from frontend (team learns two bundlers)
- CSS handling more complex with tsup
- Tailwind CSS integration not as seamless
- No HMR/dev server (tsup is build-only)
- If we add Storybook later, need Vite anyway

**Estimated Effort**: Low (1-2 hours setup)

**Cost**: Free

---

### Option 3: Material UI (MUI)

**Description**: Use Material UI component library with Vite.

**Pros**:

- Comprehensive component set
- Well-documented
- Large community
- Professional design system
- Built-in theming

**Cons**:

- npm installed (version lock-in, harder to customize)
- Material Design aesthetic (may not fit brand)
- Larger bundle size (~300KB minified)
- Runtime CSS-in-JS overhead
- Opinionated styling (harder to customize deeply)

**Estimated Effort**: Low

**Cost**: Free (MIT license)

---

### Option 4: Ant Design

**Description**: Use Ant Design component library with Vite.

**Pros**:

- Comprehensive enterprise components
- Good TypeScript support
- i18n built-in

**Cons**:

- npm installed (less customizable)
- Opinionated design language
- Larger bundle size
- Chinese-first documentation (translation quality varies)

**Estimated Effort**: Low

**Cost**: Free (MIT license)

---

### Option 5: Build Custom Components

**Description**: Build all components from scratch using Tailwind CSS.

**Pros**:

- Full control over every detail
- No external dependencies
- Exact implementation needed

**Cons**:

- High effort (weeks of work)
- Accessibility requires significant expertise
- Reinventing the wheel (testing, edge cases)
- Maintenance burden grows over time
- Delays MVP timeline significantly

**Estimated Effort**: Very High (4-6 weeks)

**Cost**: Developer time

---

## Decision Outcome

**Chosen Option**: Option 1 - shadcn/ui with Vite

**Rationale**:

We chose shadcn/ui with Vite because:

1. **Vite Consistency**: Using Vite for both `frontend` and `design-system` packages means:
   - Team learns one bundler instead of two
   - Similar configuration patterns across packages
   - CSS/PostCSS handling works identically
   - Future Storybook integration straightforward (Storybook uses Vite)

2. **Component Ownership**: shadcn/ui copies components into your codebase:
   - Full customization without forking
   - No version lock-in or breaking changes
   - Can modify individual components as needed
   - Ship only what you use (tree-shakeable)

3. **Quality Foundation**: Built on Radix UI primitives:
   - Excellent accessibility (WCAG 2.1 AA compliant)
   - Battle-tested component logic
   - Handles keyboard navigation, focus management, ARIA attributes

4. **Tailwind Integration**: Native Tailwind CSS + CSS variables:
   - Matches our CSS framework choice
   - Easy theming via CSS variables
   - No runtime CSS-in-JS overhead
   - Works with our i18n direction changes (RTL future support)

5. **Developer Experience**: Active community, great docs, regular updates

**Trade-offs Accepted**:

- Slightly more Vite config than tsup (10 lines vs 1 line) - acceptable for consistency
- Manual component updates vs npm package - acceptable for customization benefits

## Implementation Notes

**Affected Packages**:

- `packages/design-system`: Complete setup with Vite, Tailwind, shadcn CLI integration
- `packages/frontend`: Import design-system styles, configure Tailwind to scan design-system sources

**Migration Path**:

1. Replace tsup with Vite in `design-system/package.json`
2. Create `vite.config.ts` for library mode with `vite-plugin-dts`
3. Install Tailwind CSS + dependencies
4. Create `tailwind.config.ts` with CSS variables theme
5. Create `postcss.config.js` for Tailwind processing
6. Create `src/index.css` with shadcn theme (light/dark modes)
7. Create `components.json` for shadcn CLI configuration
8. Create `src/lib/utils.ts` with `cn()` helper
9. Update `package.json` exports to include CSS

**Configuration Required**:

```typescript
// packages/design-system/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], exclude: ['**/*.stories.tsx', '**/*.test.tsx'] }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' },
      },
    },
    cssCodeSplit: false, // Bundle all CSS into one file
  },
});
```

```json
// packages/design-system/components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "./src/components",
    "utils": "./src/lib",
    "ui": "./src/components/ui"
  }
}
```

**Adding Components**:

```bash
cd packages/design-system
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
# Components appear in src/components/ui/
```

**Testing Requirements**:

- [x] Vite builds design-system without errors
- [x] Frontend can import and use components
- [x] CSS is properly bundled and imported
- [x] TypeScript declarations generated correctly
- [x] Tailwind theming works (light/dark mode)
- [ ] Component unit tests with Vitest
- [ ] Visual regression tests (future: Chromatic/Percy)

**Documentation Updates**:

- [x] This ADR
- [ ] Update `docs/architecture.md` with design-system details
- [ ] Update quickstart.md with component usage examples

## Consequences

### Positive Consequences

- **Unified Build Tool**: Entire team uses Vite, reducing cognitive load
- **Component Ownership**: Can customize any component without forking or waiting for upstream
- **Accessibility**: Get Radix UI's accessibility for free
- **Performance**: No runtime CSS-in-JS overhead, smaller bundle sizes
- **Future-Proof**: Easy to add Storybook or visual testing tools (both use Vite)
- **Type Safety**: Full TypeScript support with generated declarations
- **Theming**: CSS variables make light/dark mode trivial

### Negative Consequences

- **Manual Updates**: Component updates require running shadcn CLI, not `npm update`
- **Component Sprawl**: If not careful, can accumulate many component variations
- **Initial Setup**: ~10 config lines more than tsup (one-time cost)

### Neutral Consequences

- **Build Time**: Vite slightly slower than tsup for libraries (~2s vs ~0.5s), negligible for dev experience
- **Bundle Size**: Similar to other Radix-based solutions

## Review Schedule

**Trigger Events**:

- When we need to add Storybook (Vite choice will simplify this)
- If build times become problematic (unlikely for library package)
- If shadcn/ui stops being actively maintained
- When we reach 50+ components (may need better organization)

**Next Review Date**: 2026-05-09 (6 months after initial implementation)

## References

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)
- [vite-plugin-dts](https://github.com/qmhc/vite-plugin-dts)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Plan: Phase 2 Frontend Foundation](../../specs/001-skillswap-platform/plan.md#frontend-foundation)
- [Tasks: T029 Initialize shadcn/ui theme](../../specs/001-skillswap-platform/tasks.md#phase-2-foundational-blocking-prerequisites)

---

## Change Log

| Date       | Change                 | Author      |
| ---------- | ---------------------- | ----------- |
| 2025-11-09 | Created initial ADR    | Claude Code |
| 2025-11-09 | Status set to Accepted | Claude Code |
