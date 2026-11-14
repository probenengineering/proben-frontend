# Project rules

## Source of truth

- The Figma design is the source of truth. Match spacing, sizes, colors, fonts, font weights, line heights and border radius exactly.
- Always fetch the design with the Figma MCP before building anything. Never guess from memory.
- Download real images and icons from Figma into /public. Never use placeholders.

## Design tokens

- The first Figma link I send will be the design system (colors, typography, spacing). Store these as Tailwind theme tokens.
- Always use the tokens. Never hardcode hex colors or pixel values that exist as tokens.
- If a value in Figma does not match any token, tell me instead of inventing one.

## Components

- Follow atomic design: atoms, molecules, organisms, templates, then pages.
- Before creating a component, check if one already exists. Reuse and extend it with props instead of duplicating.
- Use shadcn components as the base for atoms where it fits, then style them to match Figma.
- One component per file. File and component names in PascalCase.
- Every component has typed props with a TypeScript interface.
- Keep components small. If a file passes about 150 lines, split it.
- Pages in src/app only assemble templates and organisms. No styling logic in pages.

## Folder structure

- src/app: routes and pages only, kept thin
- src/components/ui: shadcn components (do not edit heavily)
- src/components/atoms: Button, Icon, Badge, Input, Text
- src/components/molecules: SearchBar, FormField, NavItem
- src/components/organisms: Navbar, Hero, Footer, PricingTable
- src/components/templates: page layouts that place organisms
- src/lib: utilities and helpers
- src/hooks: custom React hooks
- src/types: shared TypeScript types
- src/styles: global styles and design tokens
- public/images and public/icons: assets from Figma
- Each components folder has an index.ts for clean imports, e.g. import { Button } from "@/components/atoms"

## Responsive

- Build mobile-first with Tailwind breakpoints.
- If Figma has mobile and desktop frames, match both. If only desktop exists, ask me how mobile should behave.

## How we work

- We build gradually. I will send one Figma link at a time (a section or a screen).
- For each link:
  1. Fetch the design from Figma.
  2. Before writing code, list the components you will create or reuse, and which atomic level each belongs to. Wait for my OK.
  3. Build it.
  4. Tell me which route or page to open to see it.
  5. List anything you were unsure about or could not match exactly.
- Do not build anything I have not sent a link for.
  - Exception: auth screens the backend flow needs but Figma doesn't have yet (e.g. forgot password at `/forgot-password`). Build them from the existing auth components and screens (AuthTemplate, AuthHeading, FormField, Button, TextLink), reuse existing screens where they fit, and list them as "no Figma frame" so they can be checked when designs arrive.
- Do not add features, logic or data fetching unless I ask. Look first, logic later.
- After each section works, remind me to commit to Git.

## Project notes

- Stack: Next.js 16 (App Router, src/ dir), TypeScript, Tailwind CSS v4, shadcn/ui, ESLint, Prettier.
- Tailwind v4 has no tailwind.config file. Theme tokens live in `src/styles/globals.css` (`:root` variables + `@theme inline`).
- shadcn components go in `src/components/ui` (add with `npx shadcn@latest add <name>`). Export new components from the folder's `index.ts`.
- Commands: `npm run dev`, `npm run lint`, `npm run format`, `npm run build`.
- Node 22 is required (`nvm use` reads `.nvmrc`). Node 20.14 breaks Tailwind's loader.

## Token usage

- Design system source: Figma page "style guide" (node 4:1416).
- Colours: Tailwind's default palette is disabled. Only Figma colours exist: `green-*` (plus `green-link` #3D6838), `navy-*`, `black-*`, `white-*`, `grey-*`, `secondary-100`, `success*` (plus `success-toast` #255023), `warning*`, `error*`. App screens add `surface` #F3F3F3 (page background), `divider` #E5E5E5, `avatar-peach` #FFE7CC, `avatar-pink` #E4BACA.
- Toasts: call `showToast("error" | "success", message)` from `@/lib/toast` in client components. The `<Toaster />` is already in the root layout.
- Text styles: use `type-*` utilities (e.g. `type-heading-lg`, `type-paragraph-sm`) plus a weight (`font-medium`). They set family, size, line height and letter spacing. Do not use `text-sm`/`text-2xl` etc. for Figma text; those exist only for shadcn internals.
- Fonts: Inter Tight (default, `font-sans`) and Inter (`font-inter`).
- Spacing: Tailwind's default 4px scale. Radius: no Figma tokens yet; flag any radius used in a design.
- Not tokens on purpose: the orange "Primary/400 #F56630" in the Sidebar component and the faded 22C55E success set. Flag them if a design uses them.

@AGENTS.md
