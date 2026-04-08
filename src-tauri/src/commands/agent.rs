//! Agent 関連の Tauri commands。
//!
//! task-1C03 で `agent_create` / `agent_list_by_project` / `agent_update`
//! (`active_worktree_id` の更新を含む) を実装する。
//!
//! 各 command は薄いアダプタとして機能し、共有 `AppState` からコネクションを
//! 取り出して repo 層 (`db::repo::agent`) に委譲する。ビジネスロジックや
//! バリデーションは repo 層が担当する。
//!
//! `invoke_handler` への登録は task-1C05 で一括して行うため、本ファイルでは
//! 関数を公開するのみで Builder への配線は行わない。
//!
//! 参照: `agent-docs/tauri-commands.md` §コマンド一覧 / §Rust コマンド実装パターン

use tauri::State;

use crate::app_state::AppState;
use crate::db;
use crate::domain::agent::{Agent, AgentCreateInput, AgentUpdateInput};
use crate::error::AppResult;

/// Agent を作成する。
///
/// 成功時は生成された `Agent` (uuid / created_at / updated_at が埋まった状態) を返す。
/// `project_id` に対応する行が存在しない場合は `AppError::NotFound` を、
/// `name` が空白のみの場合は `AppError::InvalidInput` を返す。
#[tauri::command(rename_all = "camelCase")]
pub fn agent_create(state: State<'_, AppState>, input: AgentCreateInput) -> AppResult<Agent> {
    state.with_conn(|conn| db::repo::agent::create(conn, input))
}

/// 指定 project に紐付く Agent を `updated_at DESC` で取得する。
///
/// 存在しない `project_id` でもエラーとせず、空 Vec を返す。
///
/// 引数名 `project_id` は `rename_all = "camelCase"` により、フロント側からは
/// `{ projectId }` で呼び出す形になる (参照: `agent-docs/tauri-commands.md`
/// §invoke ラッパー)。
#[tauri::command(rename_all = "camelCase")]
pub fn agent_list_by_project(
    state: State<'_, AppState>,
    project_id: String,
) -> AppResult<Vec<Agent>> {
    state.with_conn(|conn| db::repo::agent::list_by_project(conn, &project_id))
}

/// Agent を更新する。
///
/// `None` のフィールドは既存値を保持する。`active_worktree_id` を含むすべての
/// 可変フィールドを更新でき、spec.md §5.1 の「Agent の active_worktree_id を
/// 更新でき、保存後に再取得しても保持されている」という受け入れ条件を満たす。
/// 対象 id が存在しない場合は `AppError::NotFound` を返す。
#[tauri::command(rename_all = "camelCase")]
pub fn agent_update(state: State<'_, AppState>, input: AgentUpdateInput) -> AppResult<Agent> {
    state.with_conn(|conn| db::repo::agent::update(conn, input))
}
