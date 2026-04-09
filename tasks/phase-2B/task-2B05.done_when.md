# task-2B05 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/store/uiStore.ts` の `UiState` インターフェースに `selectedAgentId: string | null` フィールドが存在する
  - `grep -n 'selectedAgentId' src/store/uiStore.ts` で 3 箇所以上ヒット (interface + 初期値 + action)
- `UiState` インターフェースに `setSelectedAgentId: (id: string | null) => void` action が存在する
- `useUiStore` の create 引数の初期値オブジェクトに `selectedAgentId: null` が含まれる
- `useUiStore` の create 引数に `setSelectedAgentId: (selectedAgentId) => set({ selectedAgentId })` が含まれる
- 既存 state (`route` / `activeTab` / `drawerOpen` / `drawerTab`) と既存 action が削除/変更されていない
- `pnpm tsc --noEmit` が exit 0
- `pnpm build` が success
