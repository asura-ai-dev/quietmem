# Task 1B02: マイグレーション runner

## Objective

SQL ファイルを連番で適用する軽量な自前マイグレーション runner を実装する。`schema_migrations` テーブルを管理し、冪等に実行できること。

## Scope

- `src-tauri/src/db/migration.rs`
  - `pub fn run_pending(conn: &mut Connection) -> AppResult<()>` を実装
  - 動作:
    1. `CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)`
    2. マイグレーションリスト (定数 slice) を列挙。各要素は `(version: i64, name: &'static str, sql: &'static str)`
    3. `SELECT version FROM schema_migrations ORDER BY version` で適用済みを取得
    4. 適用済みに含まれない version をバージョン昇順で 1 トランザクションずつ適用
    5. 成功したら `INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)`
  - マイグレーションリストは `include_str!("migrations/001_init.sql")` で読み込む
- `src-tauri/src/db/migrations/001_init.sql` : 空ファイルで OK (task-1B03 で中身を書く)
- `src-tauri/src/db/mod.rs` : `pub mod migration;` を追加

## Implementation Notes

- 参照: `agent-docs/db-schema.md` (マイグレーション戦略)
- マイグレーションリストはコード内の `const MIGRATIONS: &[(i64, &str, &str)] = &[(1, "init", include_str!("migrations/001_init.sql"))];` の形
- `include_str!` のパスは `src-tauri/src/db/migration.rs` から相対で `migrations/001_init.sql`
- SQL ファイル内の複数ステートメントは `conn.execute_batch(sql)` で一度に実行
- トランザクション境界は 1 マイグレーション = 1 tx (`conn.transaction()?`)
- ユニットテストを追加:
  - `open_in_memory` → `run_pending` → `schema_migrations` に version=1 が 1 件入っていること
  - `run_pending` を 2 回呼んでも追加の行が入らないこと (冪等性)
- `001_init.sql` が空でもテストは通る (`execute_batch("")` は no-op)

## Depends On

- task-1B01
