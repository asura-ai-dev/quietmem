# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/styles/tokens.css` が存在し、以下の CSS 変数を `:root` で定義:
  - `--color-sage-500`, `--color-sage-400`, `--color-sage-600`
  - `--color-gray-800`, `--color-gray-900`, `--color-gray-50`
  - `--color-amber-500`, `--color-amber-300`
  - `--bg-app`, `--bg-surface`, `--fg-primary`, `--fg-muted`
  - `--accent-primary`, `--accent-attention`
  - `--space-1`〜`--space-8`
  - `--font-sans`, `--font-mono`
  - `--radius-sm`, `--radius-md`, `--radius-lg`
- `src/styles/global.css` が存在し、`body` の背景色が `var(--bg-app)` である
- `src/main.tsx` で `tokens.css` と `global.css` の両方を import している
- `pnpm build` が成功し `dist/` に CSS が出力される
