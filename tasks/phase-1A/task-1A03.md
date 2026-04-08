# Task 1A03: Tauri + Frontend 起動確認 (Hello World)

## Objective

Tauri バックエンドと Vite フロントエンドを結合し、`pnpm tauri dev` でデスクトップアプリケーションウィンドウが起動し、フロントエンドの画面が表示されることを確認する。

## Scope

- `src/App.tsx` : QuietMem のタイトル + 「Tauri × React 起動確認」のテキストを表示する最小画面
- `src-tauri/tauri.conf.json` の再確認
  - `build.devUrl = "http://localhost:5173"`
  - `build.frontendDist = "../dist"`
  - `build.beforeDevCommand = "pnpm dev"`
  - `build.beforeBuildCommand = "pnpm build"`
- `src-tauri/src/lib.rs` : `tauri::Builder::default().run(...)` の最小構成のまま
- `package.json` の `scripts.tauri` が `tauri` (`@tauri-apps/cli` を参照)
- `package.json` に `"tauri:dev": "tauri dev"`, `"tauri:build": "tauri build"` を追加
- README 的な起動手順は作成しない (docs は別管理)

## Implementation Notes

- 参照: `agent-docs/architecture.md`, `agent-docs/tech-stack.md`
- このチケットでの確認は `cargo check` が通ること、および手動検証として `pnpm tauri dev` でウィンドウ起動を想定する
- done_when では自動検証できる部分 (`cargo check` / `pnpm build` / 主要ファイル存在) に絞り、GUI 起動の実地確認は Smoke タスク (1F05) に委ねる
- アイコンエラーが出る場合は Tauri テンプレートの icons フォルダを `src-tauri/icons/` にコピーするか、`tauri.conf.json` の `bundle.icon` を minimal にする

## Depends On

- task-1A01
- task-1A02
