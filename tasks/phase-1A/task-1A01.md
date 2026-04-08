# Task 1A01: Tauri プロジェクトスケルトン生成

## Objective

`src-tauri/` 配下に Tauri + Rust バックエンドの初期スケルトンを作成する。Cargo プロジェクトとして成立し、`cargo check` が通る状態にする。

## Scope

- `src-tauri/Cargo.toml`
  - `name = "quietmem"`, `version = "0.1.0"`, `edition = "2021"`
  - dependencies: `tauri = { version = "2", features = [] }`, `serde = { version = "1", features = ["derive"] }`, `serde_json = "1"`, `thiserror = "1"`
  - build-dependencies: `tauri-build = { version = "2", features = [] }`
- `src-tauri/build.rs`
  - `fn main() { tauri_build::build(); }`
- `src-tauri/tauri.conf.json`
  - `productName = "QuietMem"`, `identifier = "dev.quietmem.app"`
  - `build.beforeDevCommand = "pnpm dev"`, `build.beforeBuildCommand = "pnpm build"`
  - `build.devUrl = "http://localhost:5173"`, `build.frontendDist = "../dist"`
  - `app.windows[0]` : title = "QuietMem", width = 1280, height = 800
- `src-tauri/src/main.rs`
  - `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]`
  - `fn main() { quietmem_lib::run(); }`
- `src-tauri/src/lib.rs`
  - `pub fn run() { tauri::Builder::default().run(tauri::generate_context!()).expect("error while running tauri application"); }`
- `src-tauri/.gitignore` (target/, Cargo.lock は含めない設定を検討)
- リポジトリルートの `.gitignore` に `node_modules/`, `dist/`, `src-tauri/target/` を追加

## Implementation Notes

- 参照: `agent-docs/architecture.md` (ディレクトリ構成), `agent-docs/tech-stack.md` (crate 選定)
- Tauri v2 を使う (v1 ではない)
- `tauri::generate_context!()` 用の `tauri.conf.json` アイコン設定は Phase 1 では `app.windows[0].titleBarStyle` など凝った設定を入れない
- アイコンは Tauri のデフォルトテンプレートから minimal に持ってくる (`src-tauri/icons/32x32.png` 等) か、または `tauri.conf.json` の `bundle.icon` を空配列 `[]` にして Phase 1 では省略
- `lib.rs` の crate 名は `quietmem_lib` とし、`Cargo.toml` の `[lib]` に `name = "quietmem_lib"`, `crate-type = ["staticlib", "cdylib", "rlib"]` を設定
- この段階では invoke_handler は空で良い (次チケット以降で追加)

## Depends On

なし
