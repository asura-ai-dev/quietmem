# task-2C07 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
cd src-tauri && cargo build && cd ..
```

## チェック項目

- `pnpm tsc --noEmit` が exit 0 (出力に "error" が含まれない)
- `pnpm build` が exit 0 で Vite ビルド success
- `src-tauri` の `cargo build` が success (Rust 側に regression がないことの sanity check)
- `src/features/agents/AgentStatusBadge.tsx` が存在
- `src/features/agents/AgentList.tsx` で `AgentStatusBadge` を import + 使用
- `src/features/agents/AgentCreateForm.tsx` の status 入力が `<select>` 化されている
- `src/features/agents/AgentEditForm.tsx` の status 入力が `<select>` 化されている
- `src/shell/LeftSidebar.tsx` の Agents セクションが placeholder ではなく実 Agent 一覧 (`<ul>`) を表示
- `src/shell/LeftSidebar.tsx` から `useUiStore` を使って `selectedAgentId` を取得している
- `src/tabs/OverviewTab.tsx` から `useState<string | null>` での selectedAgentId 宣言が削除されている
- `src/tabs/OverviewTab.tsx` で `useUiStore` を使って selectedAgentId を取得している
- 全 Phase 1 既存 UI コンポーネント (`ProjectList`, `WorktreeList` 等) が render-time エラーなくビルドできる
