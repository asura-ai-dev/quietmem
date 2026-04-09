# task-2A04: repo::agent::duplicate 実装 + 単体テスト

## Phase

2A

## Depends on

- task-2A03

## Goal

`src-tauri/src/db/repo/agent.rs` に `duplicate(conn, input: AgentDuplicateInput) -> AppResult<Agent>` を実装し、単体テスト (`:memory:` DB) で「コピー / 強制 idle / null worktree / memory 非引継ぎ」を全て担保する。

## Scope

- `src-tauri/src/db/repo/agent.rs`
  - `pub fn duplicate(...)` 関数を追加
  - `#[cfg(test)] mod tests` に 8 ケース追加

## Implementation Notes

参照: `agent-docs/agent-duplicate-design.md` §内部処理 (repo 層)

### 関数シグネチャ

```rust
pub fn duplicate(conn: &Connection, input: AgentDuplicateInput) -> AppResult<Agent>;
```

### アルゴリズム

1. `find_by_id(conn, &input.source_agent_id)?` で source 取得
   - `None` なら `AppError::NotFound`
2. 新 name 決定:
   - `input.name = Some(raw)` なら `raw.trim()` → 空ならエラー、有効なら採用
   - `None` なら `format!("{} (copy)", source.name)`
3. 新 status = `"idle".to_string()` → `validate_agent_status(&new_status)?` (保険)
4. 新 id = `Uuid::now_v7().to_string()`
5. now = `Utc::now().to_rfc3339()`
6. 新 Agent 構造体組み立て
   - `project_id`: source からコピー
   - `role`: source からコピー
   - `adapter_type`: source からコピー
   - `prompt_path`: source からコピー
   - `config_path`: source からコピー
   - `status`: `"idle"`
   - `active_worktree_id`: `None`
   - `created_at` / `updated_at`: `now`
7. INSERT INTO agents (既存 `create` と同じカラム順 / プレースホルダ)
8. memory テーブルには **触れない** (← 重要)
9. `Ok(new_agent)` を返す

### コード例

```rust
pub fn duplicate(conn: &Connection, input: AgentDuplicateInput) -> AppResult<Agent> {
    let source = find_by_id(conn, &input.source_agent_id)?
        .ok_or_else(|| AppError::NotFound(format!(
            "agent not found: {}", input.source_agent_id
        )))?;

    let new_name = match input.name {
        Some(raw) => {
            let trimmed = raw.trim().to_string();
            if trimmed.is_empty() {
                return Err(AppError::InvalidInput("name must not be empty".into()));
            }
            trimmed
        }
        None => format!("{} (copy)", source.name),
    };

    let new_status = "idle".to_string();
    validate_agent_status(&new_status)?;

    let new_id = Uuid::now_v7().to_string();
    let now = Utc::now().to_rfc3339();

    let new_agent = Agent {
        id: new_id,
        project_id: source.project_id.clone(),
        name: new_name,
        role: source.role.clone(),
        adapter_type: source.adapter_type.clone(),
        prompt_path: source.prompt_path.clone(),
        config_path: source.config_path.clone(),
        status: new_status,
        active_worktree_id: None,
        created_at: now.clone(),
        updated_at: now,
    };

    conn.execute(
        "INSERT INTO agents (\
             id, project_id, name, role, adapter_type, \
             prompt_path, config_path, status, active_worktree_id, \
             created_at, updated_at\
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            new_agent.id,
            new_agent.project_id,
            new_agent.name,
            new_agent.role,
            new_agent.adapter_type,
            new_agent.prompt_path,
            new_agent.config_path,
            new_agent.status,
            new_agent.active_worktree_id,
            new_agent.created_at,
            new_agent.updated_at,
        ],
    )?;

    Ok(new_agent)
}
```

### import 追加

ファイル先頭の use を拡張:

```rust
use crate::domain::agent::{
    Agent, AgentCreateInput, AgentDuplicateInput, AgentUpdateInput, validate_agent_status,
};
```

(`validate_agent_status` は task-2A02 で既に追加していれば不要)

### 追加するテスト 8 ケース

`#[cfg(test)] mod tests` の末尾に追加:

#### 1. `duplicate_returns_new_agent_with_copied_fields`

- 元 Agent (role=`developer`, adapter_type=`cli`, prompt_path=Some, config_path=Some, status=`running`) を作成
- `std::thread::sleep(Duration::from_millis(10))` (id / created_at が異なることを保証)
- `duplicate(input.name=None)`
- assertions:
  - `new.id != source.id`
  - `new.created_at != source.created_at` または ≥ source.created_at
  - `new.project_id == source.project_id`
  - `new.role == source.role`
  - `new.adapter_type == source.adapter_type`
  - `new.prompt_path == source.prompt_path`
  - `new.config_path == source.config_path`
  - `new.status == "idle"` (← source は running だが強制 idle)
  - `new.active_worktree_id == None`

#### 2. `duplicate_default_name_appends_copy_suffix`

- 元 name = `"planner"` → duplicate (name=None) → `new.name == "planner (copy)"`

#### 3. `duplicate_with_custom_name_uses_input`

- 元 name = `"planner"` → duplicate (name=Some("planner-2")) → `new.name == "planner-2"`
- 前後の空白は trim される: `Some("  trim me  ")` → `"trim me"`

#### 4. `duplicate_with_empty_custom_name_returns_invalid_input`

- name=Some(" ") → InvalidInput

#### 5. `duplicate_with_missing_source_returns_not_found`

- source_agent_id="does-not-exist" → NotFound

#### 6. `duplicate_does_not_touch_memory_tables`

```rust
#[test]
fn duplicate_does_not_touch_memory_tables() {
    let conn = setup_db();
    let project_id = create_project(&conn, "no-mem");
    let source = create(&conn, sample_input(&project_id, "Source")).expect("create");

    let raw_before: i64 = conn
        .query_row("SELECT COUNT(*) FROM raw_memory_entries", [], |r| r.get(0))
        .expect("count raw_memory_entries");
    let curated_before: i64 = conn
        .query_row("SELECT COUNT(*) FROM curated_memories", [], |r| r.get(0))
        .expect("count curated_memories");

    let _new = duplicate(&conn, AgentDuplicateInput {
        source_agent_id: source.id.clone(),
        name: None,
    }).expect("duplicate");

    let raw_after: i64 = conn
        .query_row("SELECT COUNT(*) FROM raw_memory_entries", [], |r| r.get(0))
        .expect("count");
    let curated_after: i64 = conn
        .query_row("SELECT COUNT(*) FROM curated_memories", [], |r| r.get(0))
        .expect("count");

    assert_eq!(raw_before, raw_after, "raw_memory_entries should be unchanged");
    assert_eq!(curated_before, curated_after, "curated_memories should be unchanged");
}
```

#### 7. `duplicate_starts_with_idle_status_even_if_source_was_running`

- 元を `status=running` で作成 → duplicate → `new.status == "idle"`

#### 8. `duplicate_starts_with_null_active_worktree_even_if_source_had_one`

- 元 Agent を作成 → `update` で `active_worktree_id = Some("wt-xyz")` を設定
- duplicate → `new.active_worktree_id == None`

### 既存テストへの影響

- 既存テストは duplicate を呼ばないので影響なし
- 新規テストは 8 個追加 → トータルテスト数が 8 増える

## Out of scope

- `agent_duplicate` Tauri command (task-2A05)
- フロント側 service / store (task-2B02 / 2B03)
- UI 統合 (Phase 2D)
