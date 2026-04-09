# task-2C07: Phase 2C 検証 (pnpm tsc / build) + 視覚 smoke

## Phase

2C

## Depends on

- task-2C02
- task-2C03
- task-2C04
- task-2C05
- task-2C06

## Goal

Phase 2C 全タスク完了後、フロントエンドが壊れていないことを `pnpm tsc --noEmit` と `pnpm build` で確認する。さらに、4 status バリアントが視覚的に区別されることを Vite dev server (または Tauri dev) を一度起動して目視確認する。

## Scope

- 検証のみ (コード変更なし)
- 軽微な型不整合 / CSS の修正は本チケット内で対応してよい (3 行以下)

## Implementation Notes

### 自動検証手順

1. `pnpm tsc --noEmit` が exit 0
2. `pnpm build` が success (Vite ビルドエラーなし)
3. `pnpm tsc --noEmit` 実行ログに "error" が含まれない

### 視覚 smoke (任意)

可能なら以下を Tauri dev または Vite preview で目視確認する。難しい場合は手順を `agent-output/` の handoff にメモしておき、Phase 2D Smoke (task-2D03) で実施する。

1. `pnpm tauri dev` (もしくは可能なら `pnpm dev`) で起動
2. 既存 Project を選択
3. AgentCreateForm から `idle` / `running` / `error` / `needs_input` の 4 つを順に作成
4. AgentList で 4 つの Agent が並び、各 status バッジが視覚的に区別されている
   - `idle`: muted (gray border)
   - `running`: sage (緑系)
   - `error`: red (赤系)
   - `needs_input`: amber (橙系)
5. LeftSidebar の Agents セクションにも同じ 4 件が並び、status バッジが size="sm" で表示される
6. LeftSidebar の Agent 行 click と Overview の編集ボタン click で同じ id がハイライトされる
7. 編集フォームの status `<select>` で 4 値を切り替えて保存できる

### Phase 2C の期待 deliverable まとめ

- `AgentStatusBadge.tsx` + `.module.css` (新規)
- `AgentList.tsx` の status を Badge 化
- `AgentCreateForm.tsx` の status を `<select>` 化
- `AgentEditForm.tsx` の status を `<select>` 化
- `LeftSidebar.tsx` の Agents セクションを実 Agent 一覧に置換
- `OverviewTab.tsx` の selectedAgentId を uiStore 経由に切り替え

### よくある問題と対処

- **zustand 無限ループ (`Maximum update depth exceeded`)**
  - LeftSidebar の selector で `?? EMPTY_AGENTS` の安定参照が抜けている可能性
  - module スコープに `const EMPTY_AGENTS: readonly Agent[] = []` を宣言する
- **AgentList の列幅が崩れる**
  - `.itemStatus` セルを `<AgentStatusBadge>` に置換した際に grid template が崩れていないか確認
- **CSS の variant クラス名 mismatch**
  - `badge_needs_input` (アンダースコア) で統一。CSS module キーはハイフン禁止

### 不合格条件

- `pnpm tsc --noEmit` が exit 0 でない
- `pnpm build` が success でない
- 4 行以上のリファクタが必要
- LeftSidebar の Agents セクションが placeholder のまま
- AgentStatusBadge が AgentList / LeftSidebar から呼ばれていない

## Out of scope

- 複製 UI (task-2D01 / task-2D02)
- 統合 Smoke (task-2D03)
- 新規 UI 追加
- Phase 2D に属する変更
