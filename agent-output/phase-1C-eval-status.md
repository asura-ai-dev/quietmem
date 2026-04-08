# Evaluate Phase 1C

- 目的: Phase 1C (Tauri commands) の整合性と完成度を検証
- 開始日: 2026-04-08
- 更新日: 2026-04-08

## Spec Alignment

- spec.md §2.2, §4.3, §5.1, §11.2 を達成 (9 commands を invoke_handler に登録、active_worktree_id 含む)

## Phase

Complete (pass)

## Score

92 / 100 → 94 / 100 (clippy warning 修正後)

## Completed

- Phase 1C 全 5 チケット (1C01-1C05) の done_when 全項目 pass
- ビルド検証:
  - cargo check / cargo build: warning 0
  - cargo test --lib: 39/39 pass (Phase 1B から退行なし)
  - cargo clippy --all-targets: clean (orchestrator が project_list の redundant_closure 1 件を直接修正)
- 9 commands が tauri::generate_handler! に登録:
  - project_create / project_list / project_update
  - agent_create / agent_list_by_project / agent_update
  - worktree_create / worktree_list_by_project / worktree_update
- 全 commands が `state.with_conn(|conn| db::repo::xxx::yyy(conn, input))` パターン
- agent / worktree commands に `#[tauri::command(rename_all = "camelCase")]` 付与
- AppError 5 バリアントの Serialize マッピング (not_found / invalid_input / db_error / io_error / internal)
- AppState::with_conn が lock 失敗時に AppError::Internal を返す
- agent_update が active_worktree_id を含む全フィールド更新可 (1B05 repo テストでカバー)
- bindings.ts (1D01) が同じ型を表現
- services 層 (1D02) も完了し pnpm tsc --noEmit clean

## In Progress

- なし

## Not Started

- Phase 1D の残り (1D03 完了済 / 1D04 未着手 / 1D05 完了済)
- Phase 1E
- Phase 1F

## Failed Tests / Known Issues

- なし

## Known Gaps

1. project commands が `#[tauri::command(rename_all = "camelCase")]` を持たない (agent / worktree は持つ)。DTO レベルで `#[serde(rename_all = "camelCase")]` があるため動作上は問題なし。Phase 1F の cleanup で統一推奨
2. TypeScript bindings の optionality 微差: AgentCreateInput.role / adapterType, WorktreeCreateInput.baseBranch を Rust では `#[serde(default)]` で optional にしているが TS では必須にしている。実害なし (TS 側で必須にすれば呼び出し側がデフォルトを意識する形)
3. command 層単体テストは無し (repo 層で網羅、Phase 1F の smoke で結合確認予定)
4. 実機 invoke smoke は Phase 1F まで延期

## Direct Fix (Orchestrator)

- src-tauri/src/commands/project.rs:33 の clippy::redundant_closure を `state.with_conn(db::repo::project::list)` に修正 (1 行)
- 修正後 cargo clippy --all-targets clean を確認

## Key Decisions

- has_ui_ux=false / has_url=false で処理 (Rust API のみ、UI なし)
- step 2.5 と step 3 は SKIP

## Next Step

- Phase 1D の残り: #24 (task-1D04 ドメインキャッシュ store) を実装
- 1D04 完了で Phase 1D (5/5) 完了 → Evaluate Phase 1D 実行可能
- Phase 1E (Workspace Shell) 着手準備中

## Files Changed

- src-tauri/src/commands/project.rs (clippy fix, 1 行修正)
- agent-output/phase-1C-eval-status.md (新規)
