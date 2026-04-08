//! Project 関連の Tauri commands。
//!
//! task-1C02 で `project_create` / `project_list` / `project_update` を実装する。
//!
//! 各 command は薄いアダプタとして機能し、共有 `AppState` からコネクションを
//! 取り出して repo 層 (`db::repo::project`) に委譲する。ビジネスロジックや
//! バリデーションは repo 層が担当する。
//!
//! `invoke_handler` への登録は task-1C05 で一括して行うため、本ファイルでは
//! 関数を公開するのみで Builder への配線は行わない。
//!
//! 参照: `agent-docs/tauri-commands.md` §コマンド一覧 / §Rust コマンド実装パターン

use tauri::State;

use crate::app_state::AppState;
use crate::db;
use crate::domain::project::{Project, ProjectCreateInput, ProjectUpdateInput};
use crate::error::AppResult;

/// Project を作成する。
///
/// 成功時は生成された `Project` (uuid / created_at / updated_at が埋まった状態) を返す。
/// バリデーション / UNIQUE 違反時は `AppError::InvalidInput` を返す。
#[tauri::command]
pub fn project_create(state: State<'_, AppState>, input: ProjectCreateInput) -> AppResult<Project> {
    state.with_conn(|conn| db::repo::project::create(conn, input))
}

/// Project を `updated_at DESC` で全件取得する。
#[tauri::command]
pub fn project_list(state: State<'_, AppState>) -> AppResult<Vec<Project>> {
    state.with_conn(db::repo::project::list)
}

/// Project を更新する。
///
/// `None` のフィールドは既存値を保持する。対象 id が存在しない場合は
/// `AppError::NotFound` を返す。
#[tauri::command]
pub fn project_update(state: State<'_, AppState>, input: ProjectUpdateInput) -> AppResult<Project> {
    state.with_conn(|conn| db::repo::project::update(conn, input))
}
