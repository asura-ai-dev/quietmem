# Phase 2.5: チケット登録

- 目的: architect 出力の 32 チケット + 6 Evaluate タスクを TaskCreate で登録し、依存関係を設定する
- 開始日: 2026-04-08
- 更新日: 2026-04-08

## Spec Alignment

- spec.md と tasks/phases.md に基づき、Phase 1A〜1F の 32 チケットと各サブフェーズの Evaluate を全て登録。

## Phase

Complete (pass)

## Completed

- Implement タスク 32 件登録 (#5〜#35)
  - Phase 1A: #5 (1A01), #6 (1A02), #7 (1A03), #8 (1A04)
  - Phase 1B: #9 (1B01), #10 (1B02), #11 (1B03), #12 (1B04), #13 (1B05), #14 (1B06), #15 (1B07)
  - Phase 1C: #16 (1C01), #17 (1C02), #18 (1C03), #19 (1C04), #20 (1C05)
  - Phase 1D: #21 (1D01), #22 (1D02), #23 (1D03), #24 (1D04), #25 (1D05)
  - Phase 1E: #26 (1E01), #27 (1E02), #28 (1E03), #29 (1E04), #30 (1E05)
  - Phase 1F: #31 (1F01), #32 (1F02), #33 (1F03), #34 (1F04), #35 (1F05)
- 各 Implement タスクの metadata に ticket / phase / done_when_path を記録
- 各 Implement タスクの description はチケットファイルパスのみ (done_when の内容・要約は含まず)
- depends_on を addBlockedBy に変換 (Phase 2.5 = #3 を全 Implement の blockedBy に追加)
- Evaluate タスク 6 件登録:
  - #36 Evaluate Phase 1A (blocked by #5-#8)
  - #37 Evaluate Phase 1B (blocked by #9-#15)
  - #38 Evaluate Phase 1C (blocked by #16-#20)
  - #39 Evaluate Phase 1D (blocked by #21-#25)
  - #40 Evaluate Phase 1E (blocked by #26-#30, ui:true)
  - #41 Evaluate Phase 1F (blocked by #31-#35, ui:true)
- Phase 7 (#4) の blockedBy に全 6 Evaluate タスク (#36-#41) を追加

## In Progress

- なし

## Not Started

- Phase 1A 着手: 最初に実行可能な Implement タスクは #5 (task-1A01) と #6 (task-1A02) (両方 #3 のみブロック中)
- Phase 1B〜1F の実装
- 各サブフェーズの Evaluate
- Phase 7 最終報告

## Failed Tests / Known Issues

- なし

## Key Decisions

- depends_on は task-id ベースで指定されていたため、Task ID へ機械的に変換 (例: task-1B05 → #13)
- Cross-phase 依存も正しく反映: 1D01 は 1A02 (#6) と 1C04 (#19) 両方に依存、1E02 は 1E01 と 1D03 に依存、1E05 は 1E04 と 1D04 に依存
- Phase 1E と Phase 1F の Evaluate には ui:true メタデータを付与 (UI コンポーネント評価が必要)

## Next Step

- Phase 1A の Implement 開始
- TaskList で blockedBy が空になった pending タスクを取得 → contract.md で交渉要否を判定 → implement.md に従い generator agent を起動
- 最初に着手可能な並列タスク: #5 (task-1A01: Tauri プロジェクトスケルトン) と #6 (task-1A02: Vite フロントエンド雛形)

## Files Changed

- TaskCreate により 38 タスク (#5-#41) を新規登録
- TaskUpdate により 39 件の依存関係更新 (実装 32 件 + Evaluate 6 件 + Phase 7)
- agent-output/phase-2_5-status.md (新規)
