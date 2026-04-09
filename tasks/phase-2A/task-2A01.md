# task-2A01: AgentStatus ホワイトリスト + バリデータ追加

## Phase

2A

## Depends on

なし (Phase 1 完了が前提)

## Goal

`src-tauri/src/domain/agent.rs` に Agent status の有効値 4 値 (`idle` / `running` / `error` / `needs_input`) のホワイトリスト定数と、文字列を検証する `validate_agent_status` 関数を追加する。Phase 2A 以降の write 経路 (`create` / `update` / `duplicate`) で参照する基盤となる。

## Scope

- `src-tauri/src/domain/agent.rs`

## Implementation Notes

参照: `agent-docs/phase-2-status-enum.md` §Rust 側設計

### 追加するもの

1. モジュール定数 `AGENT_STATUS_VALUES`

   ```rust
   pub const AGENT_STATUS_VALUES: &[&str] = &["idle", "running", "error", "needs_input"];
   ```

   - 順序固定 (UI の select option 順を兼ねる)
   - `&'static str` 配列で十分。`enum` 化はしない (`Agent.status: String` を変えないため)

2. バリデーション関数 `validate_agent_status`

   ```rust
   use crate::error::{AppError, AppResult};

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
   ```

   - ケースセンシティブ (`"Idle"` は無効)
   - 空文字も無効 (`""` は範囲外)
   - エラー文言はテストで参照しないので英語固定 (i18n は QTM-009)

3. 同ファイルに単体テスト追加 (`#[cfg(test)] mod tests` を新規作成 or 既存セクションに追加)

   テストケース:
   - `validate_agent_status_accepts_all_four_values`
     - "idle" / "running" / "error" / "needs_input" がそれぞれ Ok を返す
   - `validate_agent_status_rejects_unknown_value`
     - "unknown" → InvalidInput
   - `validate_agent_status_rejects_empty_string`
     - "" → InvalidInput
   - `validate_agent_status_is_case_sensitive`
     - "Idle" → InvalidInput
   - `agent_status_values_contains_exactly_four_values`
     - `assert_eq!(AGENT_STATUS_VALUES.len(), 4)` + 各値存在チェック

### 注意

- 既存 `Agent` / `AgentCreateInput` / `AgentUpdateInput` 構造体には触らない
- 既存テスト (`update_with_none_fields_preserves_existing_values` で `running` を投入) と整合
- `pub const` / `pub fn` で commands 層 / repo 層から利用可能にする

## Out of scope

- `repo::agent::create` / `update` / `duplicate` への組み込み (task-2A02 / task-2A04)
- `Agent.status` の型変更 (Phase 2 では行わない)
- フロント側 (`bindings.ts` / `agentStatus.ts`) (Phase 2B)
- `enum AgentStatus { ... }` 化 (将来 QTM-009)
