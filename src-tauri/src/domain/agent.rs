//! Agent ドメイン DTO。
//!
//! `agents` テーブルに対応する出力型と、create / update 用の入力型を定義する。
//! すべて `camelCase` にシリアライズされ、フロントエンドの TS 型とミラーする
//! 形になる (詳細は `agent-docs/tauri-commands.md` §DTO 型定義 L131-L164)。
//!
//! Phase 1 では以下のフィールドを扱う:
//! - `id` (uuid v7, Rust 側で採番)
//! - `project_id` (FK)
//! - `name` / `role` / `adapter_type` / `status` (非 null, 既定値あり)
//! - `prompt_path` / `config_path` / `active_worktree_id` (nullable)
//! - `created_at` / `updated_at` (ISO8601 UTC)

use serde::{Deserialize, Serialize};

/// `agents` テーブルの 1 行を表す出力用 DTO。
///
/// - nullable 列 (`prompt_path` / `config_path` / `active_worktree_id`) は `Option<String>` で表現
/// - すべての時刻フィールドは ISO8601 UTC 文字列 (`chrono::Utc::now().to_rfc3339()`) である
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Agent {
    pub id: String,
    pub project_id: String,
    pub name: String,
    pub role: String,
    pub adapter_type: String,
    pub prompt_path: Option<String>,
    pub config_path: Option<String>,
    pub status: String,
    pub active_worktree_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

/// Agent 作成時の入力 DTO。
///
/// `id` / `created_at` / `updated_at` はサーバ側で採番するためフロントからは受け取らない。
/// `role` / `adapter_type` / `status` は未指定時に既定値 (`""` / `"cli"` / `"idle"`) が適用される。
///
/// 参照: `agent-docs/tauri-commands.md` L145-L153
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentCreateInput {
    pub project_id: String,
    pub name: String,
    #[serde(default)]
    pub role: Option<String>,
    #[serde(default)]
    pub adapter_type: Option<String>,
    #[serde(default)]
    pub prompt_path: Option<String>,
    #[serde(default)]
    pub config_path: Option<String>,
    #[serde(default)]
    pub status: Option<String>,
}

/// Agent 更新時の入力 DTO。
///
/// `None` のフィールドは変更しない (既存値を保持する)。
/// `active_worktree_id` を含むすべての可変フィールドをここで更新できる。
///
/// 注意: Phase 1 では "既存値が入っているフィールドを明示的に unset する"
/// (= NULL に戻す) 機能は要件にないため、`Option<Option<String>>` ではなく
/// `Option<String>` で表現する (チケット 1B05 Scope 参照)。
///
/// 参照: `agent-docs/tauri-commands.md` L155-L164
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentUpdateInput {
    pub id: String,
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub role: Option<String>,
    #[serde(default)]
    pub adapter_type: Option<String>,
    #[serde(default)]
    pub prompt_path: Option<String>,
    #[serde(default)]
    pub config_path: Option<String>,
    #[serde(default)]
    pub status: Option<String>,
    #[serde(default)]
    pub active_worktree_id: Option<String>,
}
