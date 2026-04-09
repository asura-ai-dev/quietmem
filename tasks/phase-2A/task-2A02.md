# task-2A02: agent_create / agent_update への status 検証組み込み

## Phase

2A

## Depends on

- task-2A01

## Goal

`repo::agent::create` と `repo::agent::update` の write 経路に `validate_agent_status` を組み込み、4 値以外の status を `AppError::InvalidInput` で reject する。Phase 1 の既存挙動 (デフォルト適用 / 部分更新) を破壊せず、status の検証だけを追加する。

## Scope

- `src-tauri/src/db/repo/agent.rs`
  - `create` 関数のロジック追加 (status のデフォルト適用直後にバリデート)
  - `update` 関数のロジック追加 (status の決定直後にバリデート)
  - 既存テストに加えて 4 つの新規テストを追加

## Implementation Notes

参照: `agent-docs/phase-2-status-enum.md` §write 経路への組み込み

### create への組み込み

既存コード (現状 L88-L91):

```rust
let status = input
    .status
    .filter(|s| !s.is_empty())
    .unwrap_or_else(|| "idle".to_string());
```

の直後に追加:

```rust
crate::domain::agent::validate_agent_status(&status)?;
```

### update への組み込み

既存コード (現状 L209) の直後に追加:

```rust
let new_status = input.status.unwrap_or_else(|| existing.status.clone());
crate::domain::agent::validate_agent_status(&new_status)?;
```

注意:

- 既存 DB 行の status が範囲外でも、ユーザーが他フィールドだけ更新するときに新たに reject される可能性がある (`existing.status` が範囲外のままマージされるため)
- これは spec.md §5.2 「シンプルに常にバリデート」方針通りで OK
- Phase 1 のテストデータ (`running`) は範囲内のため実害なし

### 追加するテスト

`#[cfg(test)] mod tests` の末尾に追加:

1. `create_with_invalid_status_returns_invalid_input`

   ```rust
   #[test]
   fn create_with_invalid_status_returns_invalid_input() {
       let conn = setup_db();
       let project_id = create_project(&conn, "inv-status");
       let err = create(
           &conn,
           AgentCreateInput {
               project_id,
               name: "X".into(),
               role: None,
               adapter_type: None,
               prompt_path: None,
               config_path: None,
               status: Some("unknown_status".into()),
           },
       )
       .expect_err("invalid status should fail");
       assert!(matches!(err, AppError::InvalidInput(_)));
   }
   ```

2. `create_accepts_all_four_status_values`

   ```rust
   #[test]
   fn create_accepts_all_four_status_values() {
       let conn = setup_db();
       let project_id = create_project(&conn, "all-status");
       for s in ["idle", "running", "error", "needs_input"] {
           let result = create(
               &conn,
               AgentCreateInput {
                   project_id: project_id.clone(),
                   name: format!("Agent-{}", s),
                   role: None,
                   adapter_type: None,
                   prompt_path: None,
                   config_path: None,
                   status: Some(s.into()),
               },
           );
           assert!(result.is_ok(), "status {:?} should be accepted", s);
       }
   }
   ```

3. `update_with_invalid_status_returns_invalid_input`

   ```rust
   #[test]
   fn update_with_invalid_status_returns_invalid_input() {
       let conn = setup_db();
       let project_id = create_project(&conn, "upd-inv");
       let created = create(&conn, sample_input(&project_id, "X")).expect("create");
       let err = update(
           &conn,
           AgentUpdateInput {
               id: created.id,
               name: None, role: None, adapter_type: None,
               prompt_path: None, config_path: None,
               status: Some("nope".into()),
               active_worktree_id: None,
           },
       )
       .expect_err("invalid status should fail");
       assert!(matches!(err, AppError::InvalidInput(_)));
   }
   ```

4. `update_accepts_needs_input_status`

   ```rust
   #[test]
   fn update_accepts_needs_input_status() {
       let conn = setup_db();
       let project_id = create_project(&conn, "upd-ni");
       let created = create(&conn, sample_input(&project_id, "X")).expect("create");
       let updated = update(
           &conn,
           AgentUpdateInput {
               id: created.id,
               name: None, role: None, adapter_type: None,
               prompt_path: None, config_path: None,
               status: Some("needs_input".into()),
               active_worktree_id: None,
           },
       )
       .expect("needs_input should be accepted");
       assert_eq!(updated.status, "needs_input");
   }
   ```

### 既存テストとの整合

- `update_with_none_fields_preserves_existing_values` は `running` を投入する。`running` は範囲内なのでバリデーションを通る。**変更不要**。
- `create_then_list_by_project_returns_one_agent` 等の既存テストは status=None でデフォルト `idle` が適用されるので破壊しない。

### import の整理

- `validate_agent_status` を `crate::domain::agent::validate_agent_status` で参照するか、ファイル先頭で `use` するかは generator 判断
- 既存の `use crate::domain::agent::{Agent, AgentCreateInput, AgentUpdateInput};` を `use crate::domain::agent::{Agent, AgentCreateInput, AgentUpdateInput, validate_agent_status};` に拡張するのが簡単

## Out of scope

- `repo::agent::duplicate` の実装 (task-2A04)
- `agent_duplicate` Tauri command (task-2A05)
- フロント側の status select 化 (Phase 2C)
- 既存 `Agent` / `AgentCreateInput` / `AgentUpdateInput` の型変更
