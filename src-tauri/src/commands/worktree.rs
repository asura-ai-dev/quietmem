//! Worktree 関連の Tauri commands。
//!
//! task-1C04 で `worktree_create` / `worktree_list_by_project` / `worktree_update`
//! を実装する。
//!
//! 各 command は薄いアダプタとして機能し、共有 `AppState` からコネクションを
//! 取り出して repo 層 (`db::repo::worktree`) に委譲する。ビジネスロジックや
//! バリデーションは repo 層が担当する。
//!
//! `invoke_handler` への登録は task-1C05 で一括して行うため、本ファイルでは
//! 関数を公開するのみで Builder への配線は行わない。
//!
//! 参照: `agent-docs/tauri-commands.md` §コマンド一覧 / §Rust コマンド実装パターン

use tauri::State;

use crate::app_state::AppState;
use crate::db;
use crate::domain::worktree::{Worktree, WorktreeCreateInput, WorktreeUpdateInput};
use crate::error::AppResult;

/// Worktree を作成する。
///
/// 成功時は生成された `Worktree` (uuid / created_at / updated_at が埋まり、
/// `base_branch` / `status` のデフォルトが適用された状態) を返す。
///
/// `project_id` に対応する行が存在しない場合は `AppError::NotFound` を、
/// `branch_name` / `path` が空白のみの場合は `AppError::InvalidInput` を返す。
#[tauri::command(rename_all = "camelCase")]
pub fn worktree_create(
    state: State<'_, AppState>,
    input: WorktreeCreateInput,
) -> AppResult<Worktree> {
    state.with_conn(|conn| db::repo::worktree::create(conn, input))
}

/// 指定 project に紐付く Worktree を `updated_at DESC` で取得する。
///
/// 存在しない `project_id` でもエラーとせず、空 Vec を返す。
///
/// 引数名 `project_id` は `rename_all = "camelCase"` により、フロント側からは
/// `{ projectId }` で呼び出す形になる (参照: `agent-docs/tauri-commands.md`
/// §invoke ラッパー)。
#[tauri::command(rename_all = "camelCase")]
pub fn worktree_list_by_project(
    state: State<'_, AppState>,
    project_id: String,
) -> AppResult<Vec<Worktree>> {
    state.with_conn(|conn| db::repo::worktree::list_by_project(conn, &project_id))
}

/// Worktree を更新する。
///
/// `None` のフィールドは既存値を保持する。`agent_id` / `branch_name` / `path` /
/// `base_branch` / `status` を更新でき、spec.md §5.1 の「Worktree を作成できる。
/// 作成した Worktree が Project ごとに一覧に表示される」「Agent と Worktree を
/// 結びつける UI」という受け入れ条件を満たすための土台となる。
/// 対象 id が存在しない場合は `AppError::NotFound` を返す。
#[tauri::command(rename_all = "camelCase")]
pub fn worktree_update(
    state: State<'_, AppState>,
    input: WorktreeUpdateInput,
) -> AppResult<Worktree> {
    state.with_conn(|conn| db::repo::worktree::update(conn, input))
}
