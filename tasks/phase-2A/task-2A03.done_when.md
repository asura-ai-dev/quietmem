# task-2A03 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo test --lib domain::agent
cargo build
cargo clippy -- -D warnings
```

## チェック項目

- `src-tauri/src/domain/agent.rs` に `pub struct AgentDuplicateInput` が存在する
  - `grep -n 'pub struct AgentDuplicateInput' src-tauri/src/domain/agent.rs` でヒット
- `AgentDuplicateInput` に `pub source_agent_id: String` フィールドがある
- `AgentDuplicateInput` に `pub name: Option<String>` フィールドがある (`#[serde(default)]` 付き)
- 構造体が `#[serde(rename_all = "camelCase")]` を持つ
- 構造体が `Deserialize` を derive している
- 単体テスト `agent_duplicate_input_deserializes_from_camel_case` (またはそれに相当する名前) が pass する
  - `{"sourceAgentId": "abc-123", "name": "custom"}` から正しく deserialize できる
- 単体テスト `agent_duplicate_input_name_is_optional` (またはそれに相当する名前) が pass する
  - `{"sourceAgentId": "abc-123"}` (name 省略) でも deserialize できる
- `cargo build` が success
- `cargo clippy -- -D warnings` が warning 0 で通る
- `cargo test --lib domain::agent` の総 pass 数が task-2A01 の状態より 2 以上増えている (任意テストを採用した場合)
