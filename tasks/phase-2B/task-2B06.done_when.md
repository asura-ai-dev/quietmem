# task-2B06 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `pnpm tsc --noEmit` が exit 0 で完了 (出力に "error" が含まれない)
- `pnpm build` が exit 0 で完了 (Vite ビルド success)
- `src/types/bindings.ts` に `AgentStatus` 型と `AgentDuplicateInput` 型が存在
- `src/features/agents/agentStatus.ts` ファイルが存在
- `src/services/agentService.ts` に `duplicate` プロパティが存在
- `src/store/agentStore.ts` に `duplicateAgent` 実装が存在
- `src/store/uiStore.ts` に `selectedAgentId` / `setSelectedAgentId` が存在
- `src/styles/tokens.css` に `--color-danger` が存在
- 既存ファイル (Phase 1 で作成された ProjectList / WorktreeList 等) のコンパイルが壊れていない
- Phase 2A の変更 (Rust 側) が影響を受けていない (`cargo build` を念のため実行して確認しても可)
