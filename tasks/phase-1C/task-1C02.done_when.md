# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo check
```

## チェック項目

- `src-tauri/src/commands/project.rs` に `project_create`, `project_list`, `project_update` の 3 関数がある
- 各関数に `#[tauri::command]` が付いている
- 各関数の戻り値型は `AppResult<Project>` または `AppResult<Vec<Project>>`
- 各関数は `AppState` を `tauri::State` 経由で受け取る
- 各関数は `db::repo::project::*` を呼び出す
- `cargo check` がエラーなし
