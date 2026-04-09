# task-2D01 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/features/agents/AgentDuplicateConfirm.tsx` ファイルが新規作成されている
- `src/features/agents/AgentDuplicateConfirm.module.css` ファイルが新規作成されている
- `AgentDuplicateConfirm` コンポーネントが default export されている
- props 型に以下が含まれる:
  - `agent: Agent`
  - `loading?: boolean`
  - `errorMessage?: string | null`
  - `onCancel: () => void`
  - `onConfirm: () => void`
- ルート要素が `<aside role="alertdialog">` である
- `aria-labelledby` と `aria-describedby` が `useId()` 経由の id を参照している
- ESC キー押下で `onCancel` が呼ばれる useEffect が存在し、cleanup で removeEventListener している
- 「引き継がれる項目」テキストが含まれる: `name` / `role` / `adapter type` / `prompt path` / `config path` のいずれか
- 「引き継がれない項目」テキストが含まれ、以下の要素を全て含む:
  - `memory` (raw / curated を含む)
  - `active worktree`
  - `status (idle で開始)` または `idle で開始`
- キャンセルボタン (`onClick={onCancel}`) と複製実行ボタン (`onClick={onConfirm}`) が存在する
- loading=true のときボタンが disabled になり、ラベルが `複製中…` に変わる
- errorMessage が non-null のとき `<p role="alert">` で表示される
- CSS module 内で raw 色値 (`#abcdef`) の直書きが存在しない (`grep -E '#[0-9a-fA-F]{3,6}' src/features/agents/AgentDuplicateConfirm.module.css` がヒットしない)
- `pnpm tsc --noEmit` が exit 0
- `pnpm build` が success
