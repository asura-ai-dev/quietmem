# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo test --lib db::migration
```

## チェック項目

- `src-tauri/src/db/migration.rs` が存在し `run_pending(conn: &mut Connection)` を公開
- `src-tauri/src/db/migrations/001_init.sql` が存在する (空でも可)
- `schema_migrations` テーブルが作成される
- `run_pending` 実行後、`schema_migrations` に version=1 の行がある
- `run_pending` を 2 回呼んでも `schema_migrations` の行数が増えない (冪等)
- `db::migration` のテストが最低 2 件存在し (基本動作 + 冪等性)、`cargo test --lib db::migration` が成功する
