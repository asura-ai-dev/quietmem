# task-2B04 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/styles/tokens.css` に `--color-red-300` が定義されている
  - `grep -n 'color-red-300' src/styles/tokens.css` でヒット
- `src/styles/tokens.css` に `--color-red-500` が定義されている
- `src/styles/tokens.css` に `--color-red-700` が定義されている
- `src/styles/tokens.css` に `--color-danger` semantic alias が定義され、`var(--color-red-500)` を参照している
- `src/styles/tokens.css` に `--color-danger-strong` が定義されている
- 既存トークン (`--color-sage-*` / `--color-gray-*` / `--color-amber-*` / `--accent-primary` 等) が削除/変更されていない
  - `grep -c 'color-sage-' src/styles/tokens.css` の結果が Phase 1 と同じ (6)
  - `grep -c 'color-gray-' src/styles/tokens.css` の結果が Phase 1 と同じ (6)
- `pnpm tsc --noEmit` が exit 0
- `pnpm build` が success
