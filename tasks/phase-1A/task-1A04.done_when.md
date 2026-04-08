# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo check
cargo test --lib paths
```

## チェック項目

- `src-tauri/src/error.rs` が存在し `AppError` / `AppResult` が定義されている
- `AppError` に `NotFound`, `InvalidInput`, `Io`, `Internal` バリアントがある
- `AppError` が `serde::Serialize` を実装している
- `src-tauri/src/paths.rs` が存在し `AppPaths` struct と以下メソッドを持つ:
  - `resolve`, `ensure_base`, `db_dir`, `db_file`, `projects_root`, `project_dir`, `agent_dir`, `agent_prompt_dir`, `agent_config_dir`, `agent_raw_dir`, `run_log_dir`, `snapshots_dir`
- `src-tauri/src/app_state.rs` が存在し `AppState { paths: AppPaths }` を公開
- `lib.rs` が `mod error; mod paths; mod app_state;` を含む
- `cargo check` がエラーなし
- `paths` モジュールに最低 1 件のユニットテストが存在し (例: `resolve()` が `Ok` を返すこと、または `project_dir` の結合が正しいこと)、`cargo test --lib paths` が成功する
