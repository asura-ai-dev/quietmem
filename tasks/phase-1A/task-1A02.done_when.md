# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm install
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `package.json` が存在し、`react`, `react-dom`, `@tauri-apps/api` が dependencies にある
- `@vitejs/plugin-react`, `vite`, `typescript`, `@tauri-apps/cli` が devDependencies にある
- `package.json` に `packageManager` が指定されている (`pnpm@9.x`)
- `tsconfig.json` が `strict: true` を含む
- `vite.config.ts` が存在し `@vitejs/plugin-react` を使用
- `index.html` が存在し、`<div id="root"></div>` と `/src/main.tsx` を参照
- `src/main.tsx`, `src/App.tsx` が存在
- `pnpm install` がエラーなく完了する
- `pnpm tsc --noEmit` がエラーなく完了する
- `pnpm build` が成功し、`dist/index.html` が生成される
