# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/routes/WorkspaceRoute.tsx` が存在
- `src/routes/WorkspaceRoute.module.css` (または同等 CSS Modules) が存在し `display: grid` と `grid-template-areas` を含む
- grid-template-areas に `header`, `left`, `main`, `right`, `drawer` の 5 領域が定義されている
- `App.tsx` が `WorkspaceRoute` を表示する
- 各領域が `var(--bg-surface)` 等のトークンを参照している
- `pnpm build` が成功
- `pnpm tsc --noEmit` がエラーなし
