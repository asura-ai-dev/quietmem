//! SQLite 接続を確立するモジュール。
//!
//! 本番 / テストいずれも以下の PRAGMA を有効化する:
//! - `PRAGMA foreign_keys = ON` (外部キー制約)
//!
//! 本番接続 (`open`) では更に `PRAGMA journal_mode = WAL` を設定する。
//! `:memory:` DB では WAL は意味がないため、`open_in_memory` では設定しない。
//!
//! 参照: `agent-docs/db-schema.md`, `agent-docs/tech-stack.md`

use std::path::Path;

use rusqlite::Connection;

use crate::error::AppResult;

/// 永続 SQLite ファイルに接続する。
///
/// - 親ディレクトリが存在しなければ作成する
/// - `Connection::open(db_file)` で接続
/// - `PRAGMA journal_mode = WAL;`
/// - `PRAGMA foreign_keys = ON;`
pub fn open(db_file: &Path) -> AppResult<Connection> {
    if let Some(parent) = db_file.parent() {
        std::fs::create_dir_all(parent)?;
    }

    let conn = Connection::open(db_file)?;

    // WAL は journal_mode を文字列で返すので execute_batch ではなく pragma_update を使う。
    // execute_batch でも動くが、エラー時の追跡がしやすいよう pragma_update を使用。
    conn.pragma_update(None, "journal_mode", "WAL")?;
    conn.pragma_update(None, "foreign_keys", "ON")?;

    Ok(conn)
}

/// `:memory:` SQLite に接続する (テスト専用)。
///
/// - `PRAGMA foreign_keys = ON;`
/// - WAL は `:memory:` では意味がないので設定しない。
#[allow(dead_code)] // テストと後続チケットから参照される
pub fn open_in_memory() -> AppResult<Connection> {
    let conn = Connection::open_in_memory()?;
    conn.pragma_update(None, "foreign_keys", "ON")?;
    Ok(conn)
}

#[cfg(test)]
mod tests {
    use super::*;

    /// `open_in_memory` で接続が確立できることを確認する。
    #[test]
    fn open_in_memory_succeeds() {
        let conn = open_in_memory().expect("open_in_memory should succeed");
        // 軽い sanity check: 簡単な SELECT が動くこと。
        let n: i64 = conn
            .query_row("SELECT 1", [], |row| row.get(0))
            .expect("SELECT 1 should succeed");
        assert_eq!(n, 1);
    }

    /// `open_in_memory` で `PRAGMA foreign_keys` が 1 (ON) になっていることを確認する。
    #[test]
    fn open_in_memory_enables_foreign_keys() {
        let conn = open_in_memory().expect("open_in_memory should succeed");
        let fk: i64 = conn
            .query_row("PRAGMA foreign_keys", [], |row| row.get(0))
            .expect("PRAGMA foreign_keys should return a row");
        assert_eq!(fk, 1, "foreign_keys should be ON");
    }

    /// `open` で物理ファイルに接続でき、`PRAGMA foreign_keys` が 1 になることを確認する。
    ///
    /// 親ディレクトリの自動作成も暗黙に検証する (tmp 配下に未作成のサブディレクトリを指定)。
    #[test]
    fn open_creates_parent_and_enables_pragmas() {
        let tmp =
            std::env::temp_dir().join(format!("quietmem-db-connection-{}", uuid::Uuid::now_v7()));
        let db_file = tmp.join("nested").join("quietmem.sqlite");
        assert!(!tmp.exists());

        let conn = open(&db_file).expect("open should succeed");

        // 親ディレクトリが作成されていること
        assert!(db_file.parent().unwrap().is_dir());
        // DB ファイルが作成されていること
        assert!(db_file.exists());

        // foreign_keys が有効
        let fk: i64 = conn
            .query_row("PRAGMA foreign_keys", [], |row| row.get(0))
            .expect("PRAGMA foreign_keys should return a row");
        assert_eq!(fk, 1);

        // journal_mode が wal になっていること
        let mode: String = conn
            .query_row("PRAGMA journal_mode", [], |row| row.get(0))
            .expect("PRAGMA journal_mode should return a row");
        assert_eq!(mode.to_lowercase(), "wal");

        // cleanup
        drop(conn);
        let _ = std::fs::remove_dir_all(&tmp);
    }
}
