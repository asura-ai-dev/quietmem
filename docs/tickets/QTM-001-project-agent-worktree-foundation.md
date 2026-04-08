# Ticket

## Title

- QTM-001 Project / Agent / Worktree Foundation

## Goal

- Tauri + React の土台、SQLite 接続、主要エンティティの最低限 CRUD を成立させる。

## Scope

- Tauri + React セットアップ
- SQLite 接続層
- `projects` / `agents` / `worktrees` の基本テーブル
- `runs` / `raw_memory_entries` / `curated_memories` の初期テーブル骨格
- 最低限の create / list / update フロー
- ローカルファイル保存先の基礎ルール定義

## Done Criteria

- アプリ起動時に SQLite を初期化できる
- Project を 1 件以上作成 / 一覧表示できる
- Agent を Project 配下に作成 / 更新できる
- Worktree メタデータを作成 / 一覧表示できる
- Agent に `active_worktree_id` を保持できる
- DB スキーマの初期版がコード化されている

## Validation

- 初期化処理の動作確認
- DB レイヤーのユニットテストまたは統合テスト
- 最低限の CRUD 手動確認

## Notes

- [L02-domain-model.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L02-domain-model.md)
- [L09-data-storage.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L09-data-storage.md)
- 以後の全チケットの前提になる
