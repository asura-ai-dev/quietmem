use std::sync::Mutex;

use rusqlite::Connection;

use crate::db;
use crate::error::{AppError, AppResult};
use crate::paths::AppPaths;

/// Tauri の `manage()` に登録する共有状態。
///
/// - `paths`: ローカルファイル保存先の規約 (AppData ルート配下)
/// - `conn`: SQLite への共有接続。Phase 1 では単一スレッド前提で
///   `Mutex<Connection>` を 1 つ保持する最小構成で足りる。
///   直接アクセスせず、原則として [`AppState::with_conn`] 経由で使う。
pub struct AppState {
    pub paths: AppPaths,
    pub conn: Mutex<Connection>,
}

impl AppState {
    /// 起動時の DB / パス初期化をまとめて行い、`AppState` を構築する。
    ///
    /// 手順:
    /// 1. `AppPaths::resolve()` で AppData ルートを解決
    /// 2. `ensure_base()` で `db/` と `projects/` を作成
    /// 3. `db::connection::open()` で SQLite 接続を確立 (WAL + foreign_keys)
    /// 4. `db::migration::run_pending()` で未適用マイグレーションを適用
    /// 5. `AppState { paths, conn: Mutex::new(conn) }` を返す
    pub fn initialize() -> AppResult<Self> {
        let paths = AppPaths::resolve()?;
        paths.ensure_base()?;

        let db_file = paths.db_file();
        let mut conn = db::connection::open(&db_file)?;
        db::migration::run_pending(&mut conn)?;

        Ok(Self {
            paths,
            conn: Mutex::new(conn),
        })
    }

    /// `Mutex<Connection>` のロックを取得し、`&Connection` をクロージャに渡す
    /// 薄いヘルパ。Tauri commands 層から 1 行で DB アクセスするために使う。
    ///
    /// ロック取得に失敗した場合 (= 他スレッドがロックを poison させた場合) は
    /// [`AppError::Internal`] を返す。Phase 1 では単一スレッド前提のため
    /// 通常の経路では発生しない想定。
    pub fn with_conn<T>(&self, f: impl FnOnce(&Connection) -> AppResult<T>) -> AppResult<T> {
        let conn = self
            .conn
            .lock()
            .map_err(|_| AppError::Internal("lock".into()))?;
        f(&conn)
    }
}
