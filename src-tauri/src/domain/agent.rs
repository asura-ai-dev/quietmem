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

use crate::error::{AppError, AppResult};

/// Agent `status` フィールドの有効値ホワイトリスト。
///
/// Phase 2 spec §5.2 に従い、`agents.status` の有効値を 4 値に制限する
/// (`idle` / `running` / `error` / `needs_input`)。順序はフロントエンドの
/// select option 順を兼ねるため固定 (idle → running → error → needs_input)。
///
/// Phase 2 では `enum AgentStatus` 化はせず、`Agent.status: String` のまま
/// `&'static str` 配列で管理する (enum 化は QTM-009 の範疇)。
/// DB カラム (`TEXT NOT NULL DEFAULT 'idle'`) は不変。前方互換のため read 時は
/// 範囲外値を拒否しない (Phase 2 spec §5.2)。
///
/// 参照: `agent-docs/phase-2-status-enum.md` §Rust 側設計
pub const AGENT_STATUS_VALUES: &[&str] = &["idle", "running", "error", "needs_input"];

/// `status` 文字列がホワイトリストに含まれるか検証する。
///
/// ケースセンシティブ (`"Idle"` は無効)、空文字も無効。
/// 範囲外の値は `AppError::InvalidInput` で reject する。
///
/// Phase 2A 以降、`repo::agent::create` / `update` / `duplicate` の write 経路で
/// この関数を呼び出す前提 (task-2A02 / task-2A04)。
///
/// エラー文言は英語固定 (i18n は QTM-009)。本関数の呼び出し側でエラー文言を
/// パースしてはならない。
pub fn validate_agent_status(status: &str) -> AppResult<()> {
    if AGENT_STATUS_VALUES.contains(&status) {
        Ok(())
    } else {
        Err(AppError::InvalidInput(format!(
            "status must be one of {} (got: {:?})",
            AGENT_STATUS_VALUES.join("|"),
            status
        )))
    }
}

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

/// `agent_duplicate` の入力 DTO。
///
/// - `source_agent_id`: 元になる Agent の id
/// - `name`: 省略時は Rust 側で `format!("{} (copy)", source.name)` を生成する
///
/// 参照: spec.md §6, agent-docs/agent-duplicate-design.md
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentDuplicateInput {
    pub source_agent_id: String,
    #[serde(default)]
    pub name: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn validate_agent_status_accepts_all_four_values() {
        // Phase 2 spec §5.2 の 4 値がすべて Ok を返すこと
        for &value in AGENT_STATUS_VALUES {
            assert!(
                validate_agent_status(value).is_ok(),
                "expected {value:?} to be accepted"
            );
        }
        // 明示的に 4 値を直接も検査 (AGENT_STATUS_VALUES が将来変更された場合の二重防御)
        assert!(validate_agent_status("idle").is_ok());
        assert!(validate_agent_status("running").is_ok());
        assert!(validate_agent_status("error").is_ok());
        assert!(validate_agent_status("needs_input").is_ok());
    }

    #[test]
    fn validate_agent_status_rejects_unknown_value() {
        let err = validate_agent_status("unknown").expect_err("unknown must be rejected");
        match err {
            AppError::InvalidInput(msg) => {
                assert!(
                    msg.contains("status must be one of"),
                    "unexpected message: {msg}"
                );
            }
            other => panic!("expected InvalidInput, got {other:?}"),
        }
    }

    #[test]
    fn validate_agent_status_rejects_empty_string() {
        let err = validate_agent_status("").expect_err("empty string must be rejected");
        assert!(
            matches!(err, AppError::InvalidInput(_)),
            "expected InvalidInput for empty string"
        );
    }

    #[test]
    fn validate_agent_status_is_case_sensitive() {
        // 大文字始まりや大文字小文字混在は拒否される (ケースセンシティブ)
        let err = validate_agent_status("Idle").expect_err("Idle must be rejected");
        assert!(
            matches!(err, AppError::InvalidInput(_)),
            "expected InvalidInput for Idle"
        );
        assert!(validate_agent_status("RUNNING").is_err());
        assert!(validate_agent_status("Needs_Input").is_err());
    }

    #[test]
    fn agent_status_values_contains_exactly_four_values() {
        assert_eq!(
            AGENT_STATUS_VALUES.len(),
            4,
            "AGENT_STATUS_VALUES must contain exactly 4 entries"
        );
        assert!(AGENT_STATUS_VALUES.contains(&"idle"));
        assert!(AGENT_STATUS_VALUES.contains(&"running"));
        assert!(AGENT_STATUS_VALUES.contains(&"error"));
        assert!(AGENT_STATUS_VALUES.contains(&"needs_input"));
    }

    #[test]
    fn agent_duplicate_input_deserializes_from_camel_case() {
        // フロントから {"sourceAgentId": "...", "name": "..."} で送った場合に
        // Rust 側の snake_case フィールドへ正しくマップされること。
        let json = r#"{"sourceAgentId": "abc-123", "name": "custom"}"#;
        let parsed: AgentDuplicateInput =
            serde_json::from_str(json).expect("camelCase JSON should deserialize");
        assert_eq!(parsed.source_agent_id, "abc-123");
        assert_eq!(parsed.name.as_deref(), Some("custom"));
    }

    #[test]
    fn agent_duplicate_input_name_is_optional() {
        // `name` を省略した JSON を deserialize できる (= #[serde(default)] が効いている)。
        // 省略時は None になり、呼び出し側で `<元 name> (copy)` を生成する想定。
        let json = r#"{"sourceAgentId": "abc-123"}"#;
        let parsed: AgentDuplicateInput =
            serde_json::from_str(json).expect("name should be optional");
        assert_eq!(parsed.source_agent_id, "abc-123");
        assert_eq!(parsed.name, None);
    }
}
