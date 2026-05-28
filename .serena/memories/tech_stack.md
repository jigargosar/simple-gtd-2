# Tech Stack

## Runtime deps (pinned)

| Package | Version |
|---|---|
| react / react-dom | ^19.2.5 |
| zustand | 5.0.12 |
| tailwindcss | 4.2.4 |
| fractional-indexing | 3.2.0 |
| remeda | 2.34.0 |
| lucide-react | 1.16.0 |
| clsx | 2.1.1 |
| uuid | 14.0.0 |

## Toolchain

- **Package manager**: pnpm
- **Build**: Vite ^8 + `tsc -b` (project references: `tsconfig.app.json` + `tsconfig.node.json`)
- **TypeScript**: ~6.0.2; `strict` umbrella OFF; explicit flags: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`
- **React Compiler**: active via `babel-plugin-react-compiler` + `@rolldown/plugin-babel` — NO manual `useMemo`/`useCallback`
- **Linter**: ESLint ^10 with `tseslint.configs.recommended` (not `recommendedTypeChecked`, no `parserOptions.project`)
- **Formatter**: Prettier 3.8.3 — single quotes, no semicolons, tab width 4, print width 100, `prettier-plugin-tailwindcss` for class sorting
- **Icons**: lucide-react
- **Tailwind**: v4 via `@tailwindcss/vite` plugin; config in `src/index.css` (`@theme`, `@keyframes`)
