# task-2A03: AgentDuplicateInput DTO 追加 (Rust)

## Phase

2A

## Depends on

- task-2A01

## Goal

`agent_duplicate` で使用する入力 DTO `AgentDuplicateInput` を Rust 側 (`domain::agent`) に追加する。`source_agent_id` と optional な `name` を持ち、camelCase で deserialize できる。

## Scope

- `src-tauri/src/domain/agent.rs`

## Implementation Notes

参照: `agent-docs/agent-duplicate-design.md` §入出力 DTO

### 追加するもの

`Agent` / `AgentCreateInput` / `AgentUpdateInput` の下に追加:

```rust
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
```

### deserialize の整合性チェック

camelCase 変換は serde の `rename_all = "camelCase"` で自動。フロントから `{ sourceAgentId: "...", name: "..." }` で送れることを確認するが、Phase 2A の単体テストは Rust 側のみ (フロントは Phase 2B)。

### import / export

- `Deserialize` は既に `use serde::{Deserialize, Serialize};` で import 済 (既存ファイル先頭)
- 追加の use は不要
- `pub` 公開で commands 層 / repo 層から参照可能にする

### 軽量な単体テスト (任意 / 推奨)

`#[cfg(test)] mod tests` に追加:

```rust
#[test]
fn agent_duplicate_input_deserializes_from_camel_case() {
    let json = r#"{"sourceAgentId": "abc-123", "name": "custom"}"#;
    let parsed: AgentDuplicateInput = serde_json::from_str(json)
        .expect("camelCase JSON should deserialize");
    assert_eq!(parsed.source_agent_id, "abc-123");
    assert_eq!(parsed.name.as_deref(), Some("custom"));
}

#[test]
fn agent_duplicate_input_name_is_optional() {
    let json = r#"{"sourceAgentId": "abc-123"}"#;
    let parsed: AgentDuplicateInput = serde_json::from_str(json)
        .expect("name should be optional");
    assert_eq!(parsed.source_agent_id, "abc-123");
    assert_eq!(parsed.name, None);
}
```

`serde_json` は `src-tauri/Cargo.toml` に既に依存があるはず (tauri が間接依存)。なければ `[dev-dependencies]` に `serde_json = "1"` を追加してもよい。Cargo.toml を確認して必要なら追記する。

## Out of scope

- `repo::agent::duplicate` の実装 (task-2A04)
- `agent_duplicate` Tauri command (task-2A05)
- フロント側 `AgentDuplicateInput` 型 (task-2B01)
- `Agent` / `AgentCreateInput` / `AgentUpdateInput` の変更
