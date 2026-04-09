# Phase 2.5 (チケット登録) — QuietMem Phase 2 / QTM-003

- 目的: Phase 2 の Implement / Evaluate チケットを TaskCreate で全て登録し、依存関係を設定する
- 開始日: 2026-04-09
- 更新日: 2026-04-09

注: Phase 1 (QTM-001+QTM-002) 用の同名ファイルは `phase-1_2_5-status.md` にリネーム済

## Spec Alignment

- `agent-docs/spec.md` (QTM-003) と `tasks/phases.md` の 22 Implement チケットを TaskCreate へ反映、各サブフェーズの Evaluate と Phase 7 ゲートを構築

## Phase

Complete (pass)

## Completed

- 22 Implement チケット登録 (タスク #5..#26)
  - Phase 2A: #5..#10 (6 件)
  - Phase 2B: #11..#16 (6 件)
  - Phase 2C: #17..#23 (7 件)
  - Phase 2D: #24..#26 (3 件)
- 各 Implement タスクに metadata 設定: `ticket` / `phase` / `done_when_path`
- 各 Implement タスクの description はチケットファイルパスのみ (done_when 内容は転載していない)
- Evaluate タスク 4 件登録
  - #27: Evaluate Phase 2A (blockedBy: #5..#10)
  - #28: Evaluate Phase 2B (blockedBy: #11..#16)
  - #29: Evaluate Phase 2C (blockedBy: #17..#23, has_ui_ux=true)
  - #30: Evaluate Phase 2D (blockedBy: #24..#26, has_ui_ux=true)
- 各 Implement タスクの addBlockedBy にチケット間 depends_on + Phase 2.5 (#3) を設定
- Phase 7 (#4) の addBlockedBy に全 4 Evaluate タスク (#27..#30) を追加

## In Progress

- なし

## Not Started (= 次フェーズ)

- Phase 2A: task-2A01 から順に Implement → verify → Evaluate
  - **最初に着手するタスク: #5 (task-2A01: AgentStatus ホワイトリスト + バリデータ追加)** — blockedBy が `[#3]` のみで、Phase 2.5 (本タスク) 完了直後に unblock する
- Phase 2B/2C/2D は前フェーズの Evaluate pass 後に進む

## Failed Tests / Known Issues

- なし

## Key Decisions

- **依存ルール**: 各 Implement タスクは Phase 2.5 (#3) と チケット内の Depends on の両方を addBlockedBy に持つ。Evaluate は同フェーズの全 Implement タスクのみを依存とする
- **`has_ui_ux=true` 設定**: Phase 2C / 2D の Evaluate に `has_ui_ux: true` を metadata 設定 (ui-reviewer 候補)
- **Phase 2.5 自体への依存**: 全 Implement タスクが Phase 2.5 (#3) に blocked されているので、本タスクが completed になると #5 (task-2A01) と #14 (task-2B04) が同時に unblock する

## Evaluate タスク ID 一覧

- Phase 2A: #27
- Phase 2B: #28
- Phase 2C: #29
- Phase 2D: #30

## Next Step

1. Phase 2.5 (本タスク #3) を completed に更新する
2. TaskList で blockedBy が空の pending を取得し、最も若い ID から処理する
3. Phase 2.5 を completed にすると #5 (task-2A01) と #14 (task-2B04) が unblock。**順序の指針**: 2A01 → 2A02/03 → 2A04 → 2A05 → 2A06 → 2B01 → 2B02/03/04/05 → 2B06 → 2C01..06 → 2C07 → 2D01 → 2D02 → 2D03

## Files Changed

- agent-output/phase-2_5-status.md (新規, Phase 2 用)
- agent-output/phase-1_2_5-status.md (旧 Phase 1 用 phase-2_5-status.md からリネーム)
