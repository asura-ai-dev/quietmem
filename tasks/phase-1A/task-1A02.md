# Task 1A02: Vite + React + TypeScript フロントエンド雛形

## Objective

リポジトリルートに pnpm + Vite + React + TypeScript のフロントエンド雛形を作成する。`pnpm tsc --noEmit` と `pnpm build` が通る状態にする。

## Scope

- `package.json`
  - `name = "quietmem"`, `private = true`, `type = "module"`, `version = "0.1.0"`
  - `scripts`:
    - `dev`: `vite`
    - `build`: `tsc -b && vite build`
    - `preview`: `vite preview`
    - `tauri`: `tauri`
  - dependencies: `react`, `react-dom`, `@tauri-apps/api`
  - devDependencies: `@vitejs/plugin-react`, `vite`, `typescript`, `@types/react`, `@types/react-dom`, `@tauri-apps/cli`
- `tsconfig.json` (Vite standard: ES2022, JSX react-jsx, strict, moduleResolution bundler)
- `tsconfig.node.json` (vite.config.ts 用)
- `vite.config.ts`
  - `plugins: [react()]`
  - `server: { port: 5173, strictPort: true }`
  - `clearScreen: false`
- `index.html` (ルート) : `<div id="root"></div>` + `<script type="module" src="/src/main.tsx"></script>`
- `src/main.tsx` : `createRoot(document.getElementById("root")!).render(<App />)`
- `src/App.tsx` : `<div>QuietMem</div>` の最小コンポーネント
- `.gitignore` (存在すれば追記、無ければ作成): `node_modules/`, `dist/`

## Implementation Notes

- 参照: `agent-docs/architecture.md` (ディレクトリ構成), `agent-docs/tech-stack.md`
- React 18 以上 / TypeScript 5 以上 / Vite 5 以上
- `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noFallthroughCasesInSwitch: true`
- `moduleResolution: "bundler"` を使う
- Tauri が `dist/` を参照するため (`src-tauri/tauri.conf.json` の `frontendDist = "../dist"`)、ビルド出力はデフォルトの `dist/` のまま
- この段階で Tauri との連携は必須ではない (`App.tsx` は静的メッセージで可)
- pnpm を使うため `packageManager = "pnpm@9.x"` を `package.json` に明記

## Depends On

なし (task-1A01 と並列実施可)
