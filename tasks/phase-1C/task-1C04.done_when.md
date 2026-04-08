# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo check
```

## チェック項目

- `src-tauri/src/commands/worktree.rs` に `worktree_create`, `worktree_list_by_project`, `worktree_update` の 3 関数がある
- 各関数に `#[tauri::command]` が付いている
- 各関数が `db::repo::worktree::*` を呼び出す
- `cargo check` がエラーなし
