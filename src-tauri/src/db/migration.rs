//! 軽量な自前マイグレーション runner。
//!
//! SQL ファイルを連番で適用し、適用済みのバージョンを `schema_migrations`
//! テーブルで管理する。2 回以上実行しても同じバージョンを再適用しない
//! (冪等性)。
//!
//! 仕様:
//! 1. `schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)` を必要なら作成
//! 2. コード内定数 `MIGRATIONS` に列挙した `(version, name, sql)` を昇順で走査
//! 3. まだ適用されていない version を 1 マイグレーション = 1 トランザクションで適用
//! 4. 適用成功時に `schema_migrations` へ `(version, applied_at)` を INSERT
//!
//! 参照: `agent-docs/db-schema.md` §マイグレーション戦略
//!
//! SQL 本体はバイナリ配布時に欠落しないよう `include_str!` で埋め込む。

use std::collections::BTreeSet;

use rusqlite::Connection;

use crate::error::AppResult;

/// 適用可能なマイグレーションの静的リスト。
///
/// 各要素は `(version, name, sql)`。`version` は昇順で並べる。
/// `sql` は `include_str!` でバイナリに埋め込む。
///
/// Phase 1B では `001_init.sql` を用意するが、中身は task-1B03 で書く。
/// 空ファイルでも `execute_batch("")` は no-op として成功するため問題ない。
const MIGRATIONS: &[(i64, &str, &str)] = &[(1, "init", include_str!("migrations/001_init.sql"))];

/// 未適用のマイグレーションを昇順で適用する。
///
/// - 既に適用済みの version はスキップする (冪等)。
/// - 各マイグレーションはトランザクション境界で適用され、SQL 失敗時は
///   ロールバックされ `schema_migrations` への INSERT も行わない。
/// - `MIGRATIONS` が version 昇順で並んでいることを前提とする。
pub fn run_pending(conn: &mut Connection) -> AppResult<()> {
    // 1) メタテーブルを必要なら作成
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version     INTEGER PRIMARY KEY,
            applied_at  TEXT NOT NULL
        )",
    )?;

    // 2) 既に適用済みの version を取得
    let applied: BTreeSet<i64> = {
        let mut stmt = conn.prepare("SELECT version FROM schema_migrations ORDER BY version")?;
        let rows = stmt.query_map([], |row| row.get::<_, i64>(0))?;
        let mut set = BTreeSet::new();
        for v in rows {
            set.insert(v?);
        }
        set
    };

    // 3) 未適用を昇順に適用
    for (version, _name, sql) in MIGRATIONS {
        if applied.contains(version) {
            continue;
        }

        let tx = conn.transaction()?;
        // 空文字列も含めて execute_batch で流す (空は no-op)。
        tx.execute_batch(sql)?;
        let applied_at = chrono::Utc::now().to_rfc3339();
        tx.execute(
            "INSERT INTO schema_migrations (version, applied_at) VALUES (?1, ?2)",
            rusqlite::params![version, applied_at],
        )?;
        tx.commit()?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::connection::open_in_memory;

    /// `run_pending` を初回実行すると `schema_migrations` に
    /// version=1 のレコードが 1 件だけ入ることを確認する。
    #[test]
    fn run_pending_applies_initial_migration() {
        let mut conn = open_in_memory().expect("open_in_memory should succeed");
        run_pending(&mut conn).expect("run_pending should succeed");

        // schema_migrations テーブルが存在する
        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM schema_migrations", [], |row| {
                row.get(0)
            })
            .expect("count query should succeed");
        assert_eq!(count, 1, "schema_migrations should contain exactly 1 row");

        // version=1 が記録されている
        let version: i64 = conn
            .query_row(
                "SELECT version FROM schema_migrations ORDER BY version LIMIT 1",
                [],
                |row| row.get(0),
            )
            .expect("version query should succeed");
        assert_eq!(version, 1);

        // applied_at が空でない ISO 文字列であること
        let applied_at: String = conn
            .query_row(
                "SELECT applied_at FROM schema_migrations WHERE version = 1",
                [],
                |row| row.get(0),
            )
            .expect("applied_at query should succeed");
        assert!(!applied_at.is_empty(), "applied_at should not be empty");
    }

    /// `run_pending` を 2 回呼んでも `schema_migrations` に
    /// 追加のレコードが入らない (冪等) ことを確認する。
    #[test]
    fn run_pending_is_idempotent() {
        let mut conn = open_in_memory().expect("open_in_memory should succeed");

        run_pending(&mut conn).expect("first run_pending should succeed");
        let count_after_first: i64 = conn
            .query_row("SELECT COUNT(*) FROM schema_migrations", [], |row| {
                row.get(0)
            })
            .expect("count query should succeed");
        assert_eq!(count_after_first, 1);

        run_pending(&mut conn).expect("second run_pending should succeed");
        let count_after_second: i64 = conn
            .query_row("SELECT COUNT(*) FROM schema_migrations", [], |row| {
                row.get(0)
            })
            .expect("count query should succeed");
        assert_eq!(
            count_after_second, 1,
            "second run_pending should not add any row"
        );
    }

    /// `schema_migrations` テーブルだけが存在する状態で `run_pending` を
    /// 呼んでも version=1 が正しく適用されることを確認する
    /// (メタテーブル作成のみ済みのケース)。
    #[test]
    fn run_pending_applies_when_meta_table_preexists() {
        let mut conn = open_in_memory().expect("open_in_memory should succeed");

        // メタテーブルだけ先に作る
        conn.execute_batch(
            "CREATE TABLE schema_migrations (
                version INTEGER PRIMARY KEY,
                applied_at TEXT NOT NULL
            )",
        )
        .expect("create meta table should succeed");

        run_pending(&mut conn).expect("run_pending should succeed");

        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM schema_migrations", [], |row| {
                row.get(0)
            })
            .expect("count query should succeed");
        assert_eq!(count, 1);
    }

    /// `run_pending` 実行後、Phase 1 で必要となる 6 テーブルが
    /// `sqlite_master` 上に作成されていることを検証する。
    #[test]
    fn run_pending_creates_all_phase1_tables() {
        let mut conn = open_in_memory().expect("open_in_memory should succeed");
        run_pending(&mut conn).expect("run_pending should succeed");

        let expected = [
            "projects",
            "agents",
            "worktrees",
            "runs",
            "raw_memory_entries",
            "curated_memories",
        ];
        for name in expected {
            let found: i64 = conn
                .query_row(
                    "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?1",
                    rusqlite::params![name],
                    |row| row.get(0),
                )
                .expect("sqlite_master query should succeed");
            assert_eq!(found, 1, "table {} should exist after run_pending", name);
        }
    }
}
