# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo build
```

## チェック項目

- `lib.rs` の `run()` が `invoke_handler(tauri::generate_handler![...])` を含む
- `generate_handler!` マクロに以下 9 個のコマンドが列挙される:
  - `commands::project::project_create`
  - `commands::project::project_list`
  - `commands::project::project_update`
  - `commands::agent::agent_create`
  - `commands::agent::agent_list_by_project`
  - `commands::agent::agent_update`
  - `commands::worktree::worktree_create`
  - `commands::worktree::worktree_list_by_project`
  - `commands::worktree::worktree_update`
- `cargo build` が成功する (リンクエラー / 未登録エラーがない)
