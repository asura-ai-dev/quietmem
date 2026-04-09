# task-2B06: Phase 2B 検証 (pnpm tsc / build)

## Phase

2B

## Depends on

- task-2B01
- task-2B02
- task-2B03
- task-2B04
- task-2B05

## Goal

Phase 2B 全タスク完了後、フロントエンド基盤 (型 / service / store / トークン) が壊れていないことを `pnpm tsc --noEmit` と `pnpm build` で確認する。Phase 2B の出力を Phase 2C (UI 強化) に引き渡せる状態にする。

## Scope

- 検証のみ (コード変更なし)
- 軽微な型不整合 (3 行以下の cast 追加など) は本チケット内で対応してよい

## Implementation Notes

### 検証手順

1. `pnpm tsc --noEmit` を実行し、型エラーがないことを確認
2. `pnpm build` を実行し、Vite ビルドが success することを確認
3. 生成物 (`dist/`) のサイズが Phase 1 完了時点 (約 84 modules) と大きく乖離していないことを目視確認

### Phase 2B の期待 deliverable まとめ

- `src/types/bindings.ts`: `AgentStatus` 型ユニオン / `AgentDuplicateInput` 追加 / Agent 関連型強化
- `src/features/agents/agentStatus.ts`: 定数 + label + isAgentStatus
- `src/services/agentService.ts`: `duplicate` メソッド追加
- `src/store/agentStore.ts`: `duplicateAgent` action 追加
- `src/store/uiStore.ts`: `selectedAgentId` + `setSelectedAgentId`
- `src/styles/tokens.css`: red パレット 3 色 + danger alias

### よくある問題と対処

- **型エラー (AgentCreateForm.status)**: task-2B01 で interim cast を入れているはず。再度確認
- **import の循環**: `bindings.ts` ↔ `agentStatus.ts` の循環は発生しないはず (`agentStatus.ts` が `bindings.ts` を import するのみ)
- **CSS module の resolution**: tokens.css は `main.tsx` から import 済 (Phase 1)。新規追加分も自動的にバンドルされる

### 不合格条件 (= 別チケット化)

- 4 行以上の型修正が必要
- 既存 UI コンポーネントが render-time エラーを出す
- pnpm build が exit 0 で終わらない
- 上記いずれかが発生したら本チケットを fail とし、対応する修正チケットを Orchestrator が新規に作成する

## Out of scope

- UI コンポーネントの本格修正 (Phase 2C)
- Rust 側変更 (Phase 2A で完了済)
- 実 Tauri 起動 (Phase 2D Smoke)
- 新機能の追加
