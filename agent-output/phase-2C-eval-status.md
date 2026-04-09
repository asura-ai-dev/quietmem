# Phase 2C Evaluate — QuietMem Phase 2 / QTM-003

- 目的: Phase 2C (UI 強化: status badge + select 化 + LeftSidebar 統合 + uiStore 接続) のフェーズ単位検証
- 開始日: 2026-04-09
- 更新日: 2026-04-09

## Spec Alignment

- spec.md §2.1 (Frontend) / §4.2 (Agent 一覧) / §4.3 (Agent 作成) / §4.4 (Agent 編集) / §4.6 (Status 表示) / §4.7 (LeftSidebar 統合) / §13.3 / §13.5 / §13.6 / §13.7 を全て満たしている

## Phase

Complete (pass)

## Result

- **result**: pass
- **evaluator score**: 95 / 100 (構造検証)
- **ui-reviewer score (Claude)**: 12 / 15 (Design 4 / Originality 4 / Craft 4)
- **ui-reviewer score (Gemini)**: 14 / 15 (Visual coherence 5 / Usability 5 / Polish 4)
- **evaluator agentId**: a5b612b4ec0b93892
- **ui-reviewer agentId**: af929863089b88386

## Tickets in scope

| ticket    | status | fix loops                                |
| --------- | ------ | ---------------------------------------- |
| task-2C01 | pass   | 0                                        |
| task-2C02 | pass   | 0                                        |
| task-2C03 | pass   | 0                                        |
| task-2C04 | pass   | 0 (SendMessage 1 回で design→実装に遷移) |
| task-2C05 | pass   | 0 (SendMessage 1 回で design→実装に遷移) |
| task-2C06 | pass   | 0                                        |
| task-2C07 | pass   | 0                                        |

## Gate

- ticket_types: [ui, ui, ui, ui, ui, logic, verification]
- has_ui_ux: **true** → ui-reviewer REQUIRED → 実行済
- has_url: true (dev server localhost:5173 既稼働) → step_2.5 evidence 確認済
- step_2_evaluator: REQUIRED → 実行済 (pass 95/100)
- step_3_ui_reviewer: REQUIRED → 実行済 (pass 12/15 + Gemini 14/15)

## Evidence

### 構造検証 (evaluator)

- `pnpm tsc --noEmit`: exit 0
- `pnpm build`: success / 87 modules (Phase 2B 84 → +3 = AgentStatusBadge.tsx + .module.css + 派生)
- `cargo build` (src-tauri): success (Phase 2A 回帰なし)
- interim cast (`as AgentStatus`) は submit body から完全削除 (Phase 2B known_gap 1 解消)
- uiStore.selectedAgentId の実参照: LeftSidebar 3 箇所 + OverviewTab 2 箇所 = 計 5 箇所 (Phase 2B known_gap 2 解消)
- Project 切替時の selectedAgentId リセット: OverviewTab の useEffect 2 つで実装 (Phase 2B known_gap 3 解消)
- EMPTY_AGENTS パターン: LeftSidebar / AgentList / OverviewTab の 3 ファイルで維持 (Phase 1F task-1F06 回帰防止)
- AgentStatusBadge a11y: `role="status"` + `aria-label="status: <label>"` + dot は `aria-hidden`
- デザイントークン: AgentStatusBadge.module.css / LeftSidebar.module.css 追加部 全て var() 経由、raw 色値 0

### 視覚検証 (ui-reviewer)

- Dev server: http://localhost:5173 (QuietMem Vite 既稼働)
- スクリーンショット: `/tmp/eval-phase-2C-iter-{1,2,3}-*.png` (全 19 枚)
- iter1 (baseline): 9/15 → iter2 (refine): 12/15 → iter3 (refine final): 12/15 pass
- Gemini cross-model review: pass (Visual 5 / Usability 5 / Polish 4)
- 主な改善内容:
  - AgentStatusBadge: idle に rgba(138,141,141,0.08) bg 追加 + hollow dot (inset ring)
  - AgentStatusBadge.size_sm: uppercase + letter-spacing 0.04em (LeftSidebar コンパクト版)
  - LeftSidebar.agentItemButtonSelected: sage 干渉解消 (fg-primary 維持 + inset ring)
  - AgentList.itemName: 15px + font-weight 600 (視線アンカー強化)
  - OverviewTab: Section hint `AGENTS · N 件` 追加
- 最終 build: 87 modules / CSS 40.72 kB / JS 185.49 kB (iter2/3 CSS refine で微増)

## Known Gaps

### ui-reviewer が残した軽微な懸念 (fail ではない)

1. AgentList grid 3 列の worktree 有無で行高差発生余地 (Phase 2D / QTM-009 で密度調整検討)
2. LeftSidebar Agent 行 hover `rgba(sage, 0.05)` が微妙 (設計意図通りの quiet 感)
3. `件` 助数詞の扱い (QTM-009 polish)
4. Status 4 値のアイコン化 (QTM-009 で検討)
5. global.css の `select:focus` 死んだルール掃除余地
6. Project 切替時の一瞬の旧 Agent 表示 race condition (未検証)

### review infrastructure の残置

- `src/main.tsx` の `?review=1` モード注入コード (Phase 1E から継承して Phase 2C で拡張)
- 本番ビルドでは発動しないが、QTM-009 polish で削除判断

### evaluator が残した懸念

- `as AgentStatus` 3 箇所は TS narrowing の必要 cast (削除不可、技術債務ではない)
- `Agent.status: AgentStatus | string` ユニオン維持 (DB 互換のため、QTM-009 で正規化検討)

## Next Step

- Phase 2D (複製 UI + 結合 Smoke) に進む
- 最初のチケット: #24 (task-2D01: AgentDuplicateConfirm コンポーネント新規作成)
- 順序: task-2D01 → task-2D02 (AgentEditForm に複製ボタン + Confirm 統合) → task-2D03 (結合 Smoke)
- Phase 2D Smoke で LeftSidebar ↔ OverviewTab の実機動作と 4 status バッジの視覚差分を再確認

## Files Changed (Phase 2C 全体)

### 新規

- src/features/agents/AgentStatusBadge.tsx
- src/features/agents/AgentStatusBadge.module.css

### 修正

- src/features/agents/AgentList.tsx (badge 置換)
- src/features/agents/AgentList.module.css (itemStatusCell ラッパ + iter2/3 視覚改善)
- src/features/agents/AgentCreateForm.tsx (status select 化 + interim cast 削除)
- src/features/agents/AgentCreateForm.module.css (.select 追加)
- src/features/agents/AgentEditForm.tsx (status select 化 + interim cast 削除 + isAgentStatus fallback)
- src/shell/LeftSidebar.tsx (Agents セクション実装 + EMPTY_AGENTS + useUiStore)
- src/shell/LeftSidebar.module.css (agentList/agentItemButton 系 + iter2/3 視覚改善)
- src/tabs/OverviewTab.tsx (ローカル useState 削除 → useUiStore + iter3 Section hint)
- src/main.tsx (review mode data injection 拡張)
