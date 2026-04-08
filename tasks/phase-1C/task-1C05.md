# Task 1C05: Tauri Builder へ commands を登録

## Objective

Phase 1C で定義したすべての commands を `tauri::Builder::invoke_handler` に登録し、フロントエンドから invoke 可能にする。

## Scope

- `src-tauri/src/lib.rs` の `run()` 関数
  - `AppState::initialize()` 呼び出しはそのまま
  - `tauri::Builder::default().manage(state).invoke_handler(tauri::generate_handler![ ... ]).run(...)` の形に変更
  - 登録するコマンド:
    - `commands::project::project_create`
    - `commands::project::project_list`
    - `commands::project::project_update`
    - `commands::agent::agent_create`
    - `commands::agent::agent_list_by_project`
    - `commands::agent::agent_update`
    - `commands::worktree::worktree_create`
    - `commands::worktree::worktree_list_by_project`
    - `commands::worktree::worktree_update`

## Implementation Notes

- 参照: `agent-docs/tauri-commands.md`
- `generate_handler!` マクロに 9 個のコマンドを並べる
- 手動検証: `pnpm tauri dev` で起動し、ブラウザ devtools (Tauri ウィンドウの右クリック → Inspect) から `await window.__TAURI__.core.invoke("project_list")` を実行して `[]` が返れば OK
- done_when はビルドが通ることを確認できれば十分とする

## Depends On

- task-1C04
