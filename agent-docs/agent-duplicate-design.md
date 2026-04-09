# Phase 2: agent_duplicate 設計

## 概要

`agent_duplicate` は元 Agent の設定 (role / adapter_type / prompt_path / config_path) をそのままコピーして新 Agent を作成する Tauri command である。memory テーブルへの書き込みは一切行わず、status は強制的に `idle`、active_worktree_id は `null` で開始する。

## 仕様からの対応

- spec.md §2.2 agent_duplicate Tauri command
- spec.md §4.5 Agent 複製
- spec.md §6 Tauri commands 追加
- spec.md §7.4 受け入れ条件 (Agent 複製)
- spec.md §13.4 Evaluator Checklist (API)
- spec.md §13.7 スタブ検出

## 入出力 DTO

### Rust 側

```rust
// src-tauri/src/domain/agent.rs に追加

/// `agent_duplicate` の入力 DTO。
///
/// - `source_agent_id`: 元になる Agent の id (TEXT primary key)
/// - `name`: 省略時は Rust 側で `format!("{} (copy)", existing.name)` を生成する
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

### TS 側

```ts
// src/types/bindings.ts に追加

export interface AgentDuplicateInput {
  sourceAgentId: string;
  name?: string | null;
}
```

### 戻り値

`Agent` (新規作成された行)。Phase 1 の `Agent` DTO と完全に同じ shape。

## 内部処理 (repo 層)

### シグネチャ

```rust
// src-tauri/src/db/repo/agent.rs に追加

/// 元 Agent の設定をコピーした新 Agent を作成する。
///
/// コピーされる項目: `project_id`, `role`, `adapter_type`, `prompt_path`, `config_path`
/// 強制初期値: `status = "idle"`, `active_worktree_id = NULL`
/// 採番される項目: `id` (uuid v7), `created_at`, `updated_at` (UTC now)
///
/// 名前は `input.name` があればそれを (trim + 空チェック)、なければ
/// `format!("{} (copy)", source.name)` を採用する。
///
/// memory テーブル (`raw_memory_entries` / `curated_memories`) には
/// **一切書き込みを行わない**。これが「memory 非引継ぎ」の実装そのもの。
///
/// # Errors
///
/// - source_agent_id が存在しないとき `AppError::NotFound`
/// - 与えられた `name` が空白のみのとき `AppError::InvalidInput`
pub fn duplicate(conn: &Connection, input: AgentDuplicateInput) -> AppResult<Agent>;
```

### アルゴリズム

```
1. find_by_id(conn, &input.source_agent_id) で source を取得
   - None なら NotFound
2. 新 name を決定:
   - input.name が Some なら trim、空ならエラー
   - None なら format!("{} (copy)", source.name)
3. 新 status = "idle"
   - validate_agent_status(&new_status)? で念のため検証
4. 新 id = Uuid::now_v7().to_string()
5. now = Utc::now().to_rfc3339()
6. 新 Agent struct を組み立てる:
     id: new_id
     project_id: source.project_id (コピー)
     name: new_name
     role: source.role (コピー)
     adapter_type: source.adapter_type (コピー)
     prompt_path: source.prompt_path (コピー)
     config_path: source.config_path (コピー)
     status: "idle"
     active_worktree_id: None
     created_at: now
     updated_at: now
7. INSERT INTO agents ... (既存 create と同じカラム順)
8. memory テーブルには触れない (= 何もしない)
9. Ok(new_agent)
```

### コード骨格 (実装目安)

```rust
pub fn duplicate(conn: &Connection, input: AgentDuplicateInput) -> AppResult<Agent> {
    // 1. 元 Agent の取得
    let source = find_by_id(conn, &input.source_agent_id)?
        .ok_or_else(|| AppError::NotFound(format!(
            "agent not found: {}", input.source_agent_id
        )))?;

    // 2. 新 name の決定
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

    // 3. 強制初期値
    let new_status = "idle".to_string();
    validate_agent_status(&new_status)?;

    // 4. 採番
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

    // 5. INSERT (memory テーブルには触れない)
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

## Tauri command 層

```rust
// src-tauri/src/commands/agent.rs に追加

/// Agent を複製する。
///
/// 元 Agent の `role` / `adapter_type` / `prompt_path` / `config_path` を引き継ぎ、
/// 新 `id` / `created_at` / `updated_at` を採番する。
/// `status` は強制的に `idle`、`active_worktree_id` は `null` で開始する。
///
/// memory テーブル (`raw_memory_entries` / `curated_memories`) には
/// 一切書き込みを行わない (= 「memory 非引継ぎ」の実装)。
///
/// 参照: agent-docs/agent-duplicate-design.md
#[tauri::command(rename_all = "camelCase")]
pub fn agent_duplicate(
    state: State<'_, AppState>,
    input: AgentDuplicateInput,
) -> AppResult<Agent> {
    state.with_conn(|conn| db::repo::agent::duplicate(conn, input))
}
```

`src-tauri/src/lib.rs` の `invoke_handler` に追加:

```rust
.invoke_handler(tauri::generate_handler![
    // ...既存...
    commands::agent::agent_create,
    commands::agent::agent_list_by_project,
    commands::agent::agent_update,
    commands::agent::agent_duplicate,   // ← 追加
    // ...
])
```

## TS service / store

### agentService

```ts
// src/services/agentService.ts

const agentService = {
  // ...既存...
  duplicate: (input: AgentDuplicateInput): Promise<Agent> =>
    invoke<Agent>("agent_duplicate", { input }),
} as const;
```

### agentStore

```ts
// src/store/agentStore.ts に追加

export interface AgentState {
  // ...既存...
  duplicateAgent: (input: AgentDuplicateInput) => Promise<Agent>;
}

// 実装
duplicateAgent: async (input) => {
  set({ loading: true, error: null });
  try {
    const agent = await agentService.duplicate(input);
    // 新 agent の projectId は戻り値から取得して refresh
    await get().refreshAgents(agent.projectId);
    return agent;
  } catch (err) {
    set({ loading: false, error: toErrorMessage(err) });
    throw err;
  }
},
```

呼び出し側 (UI) は戻り値の `agent.id` を `selectedAgentId` にセットすることで、複製直後に新 Agent が選択状態になるフローを実現する。

## エラー条件まとめ

| 入力                            | 結果                    |
| ------------------------------- | ----------------------- |
| 存在する `sourceAgentId`        | `Ok(Agent)`             |
| 存在しない `sourceAgentId`      | `NotFound`              |
| `name = Some("   ")` (空白のみ) | `InvalidInput`          |
| `name = Some("custom")` (有効)  | `Ok(Agent)`             |
| `name = None`                   | `Ok(Agent)` (auto-name) |

## テスト方針 (Rust)

`src-tauri/src/db/repo/agent.rs` の `#[cfg(test)] mod tests` に追加する。

### テストケース

1. `duplicate_returns_new_agent_with_copied_fields`
   - 元 Agent を作成 → duplicate → 新 Agent の id / created_at / updated_at が元と異なる
   - role / adapter_type / prompt_path / config_path / project_id が元と一致
   - status が `"idle"`、active_worktree_id が `None`

2. `duplicate_default_name_appends_copy_suffix`
   - 元 name = `"planner"` → duplicate (name=None) → 新 name = `"planner (copy)"`

3. `duplicate_with_custom_name_uses_input`
   - 元 name = `"planner"` → duplicate (name=Some("planner-2")) → 新 name = `"planner-2"`

4. `duplicate_with_empty_custom_name_returns_invalid_input`
   - name=Some(" ") → `InvalidInput`

5. `duplicate_with_missing_source_returns_not_found`
   - 存在しない id → `NotFound`

6. `duplicate_does_not_touch_memory_tables`
   - 元 Agent を作成
   - `SELECT COUNT(*) FROM raw_memory_entries` を記録
   - `SELECT COUNT(*) FROM curated_memories` を記録
   - duplicate 実行
   - 同 COUNT を再計測 → 両方とも変化していない
   - **このテストが「memory 非引継ぎ」の正本検証**

7. `duplicate_starts_with_idle_status_even_if_source_was_running`
   - 元 Agent を `running` で作成 → duplicate → 新 Agent.status == `"idle"`

8. `duplicate_starts_with_null_active_worktree_even_if_source_had_one`
   - 元 Agent に active_worktree_id を設定 → duplicate → 新 Agent.active_worktree_id == None

## 制約・注意事項

- ID は **必ず Rust 側で採番** する。フロントから新 id を渡さない (Phase 1 規約継承)
- created_at / updated_at も Rust 側で生成 (新規行は必ず同値で開始)
- 元 Agent の `id` を変更しない (read-only コピー元として扱う)
- 名前重複は許容する (`agents.name` に UNIQUE 制約なし)。同 project 内に `planner` が 2 つあっても OK
- duplicate 後の楽観更新は行わない (`refreshAgents` で再取得する)
- memory テーブルへの INSERT を **絶対に書かない**。Phase 2 のレビューチェック対象 (spec.md §13.7)
