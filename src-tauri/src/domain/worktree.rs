//! Worktree ドメイン DTO。
//!
//! `worktrees` テーブルに対応する出力型と、create / update 用の入力型を定義する。
//! すべて `camelCase` にシリアライズされ、フロントエンドの TS 型とミラーする
//! 形になる (詳細は `agent-docs/tauri-commands.md` §DTO 型定義 L166-L194)。
//!
//! Phase 1 では以下のフィールドを扱う:
//! - `id` (uuid v7, Rust 側で採番)
//! - `project_id` (FK)
//! - `agent_id` (nullable, 循環回避のため FK は張らない)
//! - `branch_name` / `path` (非 null, 空不可)
//! - `base_branch` (既定値 `"main"`)
//! - `status` (既定値 `"ready"`)
//! - `created_at` / `updated_at` (ISO8601 UTC)

use serde::{Deserialize, Serialize};

/// `worktrees` テーブルの 1 行を表す出力用 DTO。
///
/// - nullable 列 (`agent_id`) は `Option<String>` で表現
/// - すべての時刻フィールドは ISO8601 UTC 文字列 (`chrono::Utc::now().to_rfc3339()`) である
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Worktree {
    pub id: String,
    pub project_id: String,
    pub agent_id: Option<String>,
    pub branch_name: String,
    pub path: String,
    pub base_branch: String,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

/// Worktree 作成時の入力 DTO。
///
/// `id` / `created_at` / `updated_at` はサーバ側で採番するためフロントからは受け取らない。
/// `base_branch` / `status` は未指定時に既定値 (`"main"` / `"ready"`) が適用される。
///
/// 参照: `agent-docs/tauri-commands.md` L178-L185
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorktreeCreateInput {
    pub project_id: String,
    #[serde(default)]
    pub agent_id: Option<String>,
    pub branch_name: String,
    pub path: String,
    #[serde(default)]
    pub base_branch: Option<String>,
    #[serde(default)]
    pub status: Option<String>,
}

/// Worktree 更新時の入力 DTO。
///
/// `None` のフィールドは変更しない (既存値を保持する)。
///
/// 注意: Phase 1 では "既存値が入っているフィールドを明示的に unset する"
/// (= NULL に戻す) 機能は要件にないため、`Option<Option<String>>` ではなく
/// `Option<String>` で表現する (1B05 と同方針)。
///
/// 参照: `agent-docs/tauri-commands.md` L187-L194
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorktreeUpdateInput {
    pub id: String,
    #[serde(default)]
    pub agent_id: Option<String>,
    #[serde(default)]
    pub branch_name: Option<String>,
    #[serde(default)]
    pub path: Option<String>,
    #[serde(default)]
    pub base_branch: Option<String>,
    #[serde(default)]
    pub status: Option<String>,
}
