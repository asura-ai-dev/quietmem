//! Project ドメイン DTO。
//!
//! `projects` テーブルに対応する出力型と、create / update 用の入力型を定義する。
//! すべて `camelCase` にシリアライズされ、フロントエンドの TS 型とミラーする
//! 形になる (詳細は `agent-docs/tauri-commands.md`)。

use serde::{Deserialize, Serialize};

/// `projects` テーブルの 1 行を表す出力用 DTO。
///
/// すべての時刻フィールドは ISO8601 UTC 文字列 (`chrono::Utc::now().to_rfc3339()`) である。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub root_path: String,
    pub created_at: String,
    pub updated_at: String,
}

/// Project 作成時の入力 DTO。
///
/// `id` / `created_at` / `updated_at` はサーバ側で採番するためフロントからは受け取らない。
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectCreateInput {
    pub name: String,
    pub slug: String,
    pub root_path: String,
}

/// Project 更新時の入力 DTO。
///
/// `None` のフィールドは変更しない (既存値を保持する)。
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectUpdateInput {
    pub id: String,
    pub name: Option<String>,
    pub slug: Option<String>,
    pub root_path: Option<String>,
}
