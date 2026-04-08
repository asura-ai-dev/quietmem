# Task 1F05: 統合 Smoke Flow の通し

## Objective

spec.md §9 の想定ユーザーフローを手動で通し、Phase 1 の受け入れ条件がすべて満たされることを確認する。最終的な全体ビルドと、問題があれば修正を行う。

## Scope

- `pnpm tauri dev` で起動して以下を実地確認:
  1. 初回起動 (DB ファイルを削除した状態) → 初回セットアップ画面に遷移する
  2. Project を作成 → Workspace Shell に遷移する
  3. Overview タブで Project が表示されている
  4. LeftSidebar または Overview から Agent を作成する
  5. Worktree を作成する
  6. Agent 編集で `activeWorktreeId` に作成済み Worktree を割り当てる
  7. Agent 一覧で `activeWorktreeId` が反映されている (branchName が表示されている)
  8. MainTabs を Editor / Memory / Runs / Cron に切り替え、それぞれプレースホルダが表示される
  9. BottomDrawer を開閉できる
  10. Header から Settings 別画面へ遷移 → 「戻る」でワークスペースに戻る
  11. Dashboard 別画面も同様に確認
  12. アプリ終了後、再起動して作成した Project / Agent / Worktree と関連が保持されている
- 問題があれば根本原因を特定し、関連チケットを更新するか直接修正する (修正量 3 行以下なら Orchestrator 判断で直接修正可、ただし verify 再実行)

## Implementation Notes

- 参照: `agent-docs/ui-shell.md`, `agent-docs/architecture.md`, spec.md §9 / §11
- DB ファイルの場所は macOS で `~/Library/Application Support/QuietMem/db/quietmem.sqlite` (または `dev.quietmem.QuietMem` ベース)
- 再起動確認は `pnpm tauri dev` を 1 度終了し、再度起動する形で行う
- 結合テスト (Rust 側 `cargo test`) も最終回実行する
- このチケットは手動確認主体だが、実装変更が無いまま done とするか、軽微な UI 調整を含めても良い

## Depends On

- task-1F04
