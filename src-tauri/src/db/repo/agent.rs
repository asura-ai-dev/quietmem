//! `agents` テーブルに対する CRUD 実装。
//!
//! - `create`: project_id の存在チェック → uuid v7 を採番し、created_at / updated_at に
//!   現在時刻 (ISO8601 UTC) を入れて INSERT
//! - `list_by_project`: `WHERE project_id = ? ORDER BY updated_at DESC` で取得 (存在しない
//!   project_id でも空 Vec を返す)
//! - `update`: 既存行を SELECT → 指定フィールドのみマージ → UPDATE。`active_worktree_id`
//!   を含むすべての可変フィールドに対応する
//!
//! バリデーション方針:
//! - `name` が空白のみなら `InvalidInput`
//! - `role` / `adapter_type` / `status` は未指定時にデフォルト (`""` / `"cli"` / `"idle"`) を適用
//! - project_id が存在しなければ `NotFound`
//! - update 対象 id が存在しなければ `NotFound`
//!
//! 参照: `agent-docs/tauri-commands.md`, `agent-docs/db-schema.md`

use chrono::Utc;
use rusqlite::{params, Connection, OptionalExtension, Row};
use uuid::Uuid;

use crate::domain::agent::{Agent, AgentCreateInput, AgentUpdateInput};
use crate::error::{AppError, AppResult};

/// `agents` の 1 行を `Agent` にマップする共通ヘルパ。
fn row_to_agent(row: &Row<'_>) -> rusqlite::Result<Agent> {
    Ok(Agent {
        id: row.get("id")?,
        project_id: row.get("project_id")?,
        name: row.get("name")?,
        role: row.get("role")?,
        adapter_type: row.get("adapter_type")?,
        prompt_path: row.get("prompt_path")?,
        config_path: row.get("config_path")?,
        status: row.get("status")?,
        active_worktree_id: row.get("active_worktree_id")?,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
    })
}

/// 指定 project_id の行が `projects` テーブルに存在するかを判定する。
///
/// `SELECT 1 FROM projects WHERE id = ? LIMIT 1` で軽量に確認する。
fn project_exists(conn: &Connection, project_id: &str) -> AppResult<bool> {
    let found: Option<i64> = conn
        .query_row(
            "SELECT 1 FROM projects WHERE id = ?1 LIMIT 1",
            params![project_id],
            |row| row.get(0),
        )
        .optional()?;
    Ok(found.is_some())
}

/// Agent を作成する。
///
/// 成功時は生成された行 (uuid / created_at / updated_at が埋まった状態) を返す。
///
/// # Errors
///
/// - `name` が空白のみなら `InvalidInput`
/// - `project_id` に対応する行が存在しなければ `NotFound`
pub fn create(conn: &Connection, input: AgentCreateInput) -> AppResult<Agent> {
    let project_id = input.project_id.trim();
    let name = input.name.trim();

    if project_id.is_empty() {
        return Err(AppError::InvalidInput("projectId must not be empty".into()));
    }
    if name.is_empty() {
        return Err(AppError::InvalidInput("name must not be empty".into()));
    }

    if !project_exists(conn, project_id)? {
        return Err(AppError::NotFound(format!(
            "project not found: {}",
            project_id
        )));
    }

    // デフォルト値の適用 (db-schema.md の DEFAULT と揃える)
    let role = input.role.unwrap_or_default();
    let adapter_type = input
        .adapter_type
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "cli".to_string());
    let status = input
        .status
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "idle".to_string());

    let id = Uuid::now_v7().to_string();
    let now = Utc::now().to_rfc3339();

    let agent = Agent {
        id,
        project_id: project_id.to_string(),
        name: name.to_string(),
        role,
        adapter_type,
        prompt_path: input.prompt_path,
        config_path: input.config_path,
        status,
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
            agent.id,
            agent.project_id,
            agent.name,
            agent.role,
            agent.adapter_type,
            agent.prompt_path,
            agent.config_path,
            agent.status,
            agent.active_worktree_id,
            agent.created_at,
            agent.updated_at,
        ],
    )?;

    Ok(agent)
}

/// 指定 project_id に紐付く Agent を `updated_at DESC` で取得する。
///
/// 存在しない project_id であってもエラーとせず、空 Vec を返す。
pub fn list_by_project(conn: &Connection, project_id: &str) -> AppResult<Vec<Agent>> {
    let mut stmt = conn.prepare(
        "SELECT id, project_id, name, role, adapter_type, \
                prompt_path, config_path, status, active_worktree_id, \
                created_at, updated_at \
         FROM agents \
         WHERE project_id = ?1 \
         ORDER BY updated_at DESC",
    )?;

    let rows = stmt.query_map(params![project_id], row_to_agent)?;
    let mut agents = Vec::new();
    for row in rows {
        agents.push(row?);
    }
    Ok(agents)
}

/// 指定 id の Agent を取得する (存在しなければ `None`)。
fn find_by_id(conn: &Connection, id: &str) -> AppResult<Option<Agent>> {
    let result = conn
        .query_row(
            "SELECT id, project_id, name, role, adapter_type, \
                    prompt_path, config_path, status, active_worktree_id, \
                    created_at, updated_at \
             FROM agents WHERE id = ?1",
            params![id],
            row_to_agent,
        )
        .optional()?;
    Ok(result)
}

/// Agent を更新する。
///
/// `None` のフィールドは変更せず既存値を保持する。
/// `active_worktree_id` を含むすべての可変フィールドを更新できる。
/// 成功時は更新後の行を返す。
///
/// # Errors
///
/// - 対象 id が存在しなければ `NotFound`
/// - 指定された `name` が空白のみなら `InvalidInput`
pub fn update(conn: &Connection, input: AgentUpdateInput) -> AppResult<Agent> {
    let existing = find_by_id(conn, &input.id)?
        .ok_or_else(|| AppError::NotFound(format!("agent not found: {}", input.id)))?;

    // マージ: None のフィールドは既存値を保持
    let new_name = match input.name {
        Some(v) => {
            let v = v.trim().to_string();
            if v.is_empty() {
                return Err(AppError::InvalidInput("name must not be empty".into()));
            }
            v
        }
        None => existing.name.clone(),
    };
    let new_role = input.role.unwrap_or_else(|| existing.role.clone());
    let new_adapter_type = input
        .adapter_type
        .unwrap_or_else(|| existing.adapter_type.clone());
    // prompt_path / config_path は Option<String> として既存値を上書き (Some なら差し替え)。
    // Phase 1 では明示的に NULL に戻す要件はないため、None は「未指定 = 既存保持」扱い。
    let new_prompt_path = match input.prompt_path {
        Some(v) => Some(v),
        None => existing.prompt_path.clone(),
    };
    let new_config_path = match input.config_path {
        Some(v) => Some(v),
        None => existing.config_path.clone(),
    };
    let new_status = input.status.unwrap_or_else(|| existing.status.clone());
    let new_active_worktree_id = match input.active_worktree_id {
        Some(v) => Some(v),
        None => existing.active_worktree_id.clone(),
    };

    let new_updated_at = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE agents SET \
             name = ?1, \
             role = ?2, \
             adapter_type = ?3, \
             prompt_path = ?4, \
             config_path = ?5, \
             status = ?6, \
             active_worktree_id = ?7, \
             updated_at = ?8 \
         WHERE id = ?9",
        params![
            new_name,
            new_role,
            new_adapter_type,
            new_prompt_path,
            new_config_path,
            new_status,
            new_active_worktree_id,
            new_updated_at,
            existing.id,
        ],
    )?;

    Ok(Agent {
        id: existing.id,
        project_id: existing.project_id,
        name: new_name,
        role: new_role,
        adapter_type: new_adapter_type,
        prompt_path: new_prompt_path,
        config_path: new_config_path,
        status: new_status,
        active_worktree_id: new_active_worktree_id,
        created_at: existing.created_at,
        updated_at: new_updated_at,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::connection::open_in_memory;
    use crate::db::migration::run_pending;
    use crate::db::repo::project as project_repo;
    use crate::domain::project::ProjectCreateInput;

    /// テスト用に `:memory:` DB を立ち上げて全マイグレーションを適用する。
    fn setup_db() -> Connection {
        let mut conn = open_in_memory().expect("open_in_memory should succeed");
        run_pending(&mut conn).expect("run_pending should succeed");
        conn
    }

    /// テスト用に 1 件 project を作成して id を返す。
    fn create_project(conn: &Connection, slug: &str) -> String {
        let project = project_repo::create(
            conn,
            ProjectCreateInput {
                name: format!("Project {}", slug),
                slug: slug.to_string(),
                root_path: format!("/tmp/{}", slug),
            },
        )
        .expect("create project should succeed");
        project.id
    }

    fn sample_input(project_id: &str, name: &str) -> AgentCreateInput {
        AgentCreateInput {
            project_id: project_id.to_string(),
            name: name.to_string(),
            role: Some("developer".to_string()),
            adapter_type: Some("cli".to_string()),
            prompt_path: None,
            config_path: None,
            status: None,
        }
    }

    /// create → list_by_project で 1 件返ること。
    #[test]
    fn create_then_list_by_project_returns_one_agent() {
        let conn = setup_db();
        let project_id = create_project(&conn, "alpha");

        let created =
            create(&conn, sample_input(&project_id, "Alpha Agent")).expect("create should succeed");

        assert!(!created.id.is_empty(), "id should be generated");
        assert_eq!(created.project_id, project_id);
        assert_eq!(created.name, "Alpha Agent");
        assert_eq!(created.role, "developer");
        assert_eq!(created.adapter_type, "cli");
        assert_eq!(created.status, "idle", "status default should be 'idle'");
        assert_eq!(created.prompt_path, None);
        assert_eq!(created.config_path, None);
        assert_eq!(created.active_worktree_id, None);
        assert!(!created.created_at.is_empty());
        assert_eq!(
            created.created_at, created.updated_at,
            "on create, created_at and updated_at should match"
        );

        let listed = list_by_project(&conn, &project_id).expect("list should succeed");
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0], created);
    }

    /// 未指定フィールドのデフォルト値が適用されること。
    #[test]
    fn create_applies_default_values() {
        let conn = setup_db();
        let project_id = create_project(&conn, "defaults");

        let created = create(
            &conn,
            AgentCreateInput {
                project_id: project_id.clone(),
                name: "Minimal Agent".into(),
                role: None,
                adapter_type: None,
                prompt_path: None,
                config_path: None,
                status: None,
            },
        )
        .expect("create should succeed");

        assert_eq!(created.role, "", "role default should be empty string");
        assert_eq!(
            created.adapter_type, "cli",
            "adapter_type default should be 'cli'"
        );
        assert_eq!(created.status, "idle", "status default should be 'idle'");
    }

    /// 存在しない project_id で create すると NotFound になること。
    #[test]
    fn create_with_missing_project_returns_not_found() {
        let conn = setup_db();

        let err = create(
            &conn,
            sample_input("does-not-exist-project", "Orphan Agent"),
        )
        .expect_err("create with unknown project should fail");

        assert!(
            matches!(err, AppError::NotFound(_)),
            "expected NotFound, got {:?}",
            err
        );
    }

    /// 空文字の name で create すると InvalidInput になること。
    #[test]
    fn create_with_empty_name_returns_invalid_input() {
        let conn = setup_db();
        let project_id = create_project(&conn, "empty-name");

        let err = create(
            &conn,
            AgentCreateInput {
                project_id,
                name: "   ".into(),
                role: None,
                adapter_type: None,
                prompt_path: None,
                config_path: None,
                status: None,
            },
        )
        .expect_err("empty name should fail");

        assert!(
            matches!(err, AppError::InvalidInput(_)),
            "expected InvalidInput, got {:?}",
            err
        );
    }

    /// 存在しない project_id で list_by_project すると空 Vec を返すこと。
    #[test]
    fn list_by_project_with_missing_project_returns_empty() {
        let conn = setup_db();

        let listed = list_by_project(&conn, "does-not-exist-project")
            .expect("list should succeed even with missing project");
        assert!(listed.is_empty());
    }

    /// list_by_project は project_id でフィルタし、`updated_at DESC` で並ぶこと。
    #[test]
    fn list_by_project_filters_and_orders_by_updated_at_desc() {
        let conn = setup_db();
        let project_a = create_project(&conn, "proj-a");
        let project_b = create_project(&conn, "proj-b");

        // project_a に 2 件、project_b に 1 件
        let a_first =
            create(&conn, sample_input(&project_a, "A-first")).expect("create should succeed");
        std::thread::sleep(std::time::Duration::from_millis(10));
        let a_second =
            create(&conn, sample_input(&project_a, "A-second")).expect("create should succeed");
        std::thread::sleep(std::time::Duration::from_millis(10));
        let _b_only =
            create(&conn, sample_input(&project_b, "B-only")).expect("create should succeed");

        let listed_a = list_by_project(&conn, &project_a).expect("list should succeed");
        assert_eq!(listed_a.len(), 2, "project_a should have exactly 2 agents");
        // 直近 create した順で並ぶ (updated_at DESC)
        assert_eq!(listed_a[0].id, a_second.id);
        assert_eq!(listed_a[1].id, a_first.id);

        let listed_b = list_by_project(&conn, &project_b).expect("list should succeed");
        assert_eq!(listed_b.len(), 1, "project_b should have exactly 1 agent");
    }

    /// update で name / role を変更できること。
    #[test]
    fn update_name_and_role() {
        let conn = setup_db();
        let project_id = create_project(&conn, "upd-name");
        let created =
            create(&conn, sample_input(&project_id, "Old Name")).expect("create should succeed");

        std::thread::sleep(std::time::Duration::from_millis(10));

        let updated = update(
            &conn,
            AgentUpdateInput {
                id: created.id.clone(),
                name: Some("New Name".into()),
                role: Some("reviewer".into()),
                adapter_type: None,
                prompt_path: None,
                config_path: None,
                status: None,
                active_worktree_id: None,
            },
        )
        .expect("update should succeed");

        assert_eq!(updated.id, created.id);
        assert_eq!(updated.name, "New Name");
        assert_eq!(updated.role, "reviewer");
        assert_eq!(
            updated.adapter_type, created.adapter_type,
            "adapter_type should be preserved"
        );
        assert_eq!(updated.status, created.status, "status should be preserved");
        assert_eq!(
            updated.created_at, created.created_at,
            "created_at should not change"
        );
        assert_ne!(
            updated.updated_at, created.updated_at,
            "updated_at should advance"
        );
    }

    /// update で active_worktree_id に値を設定できること。
    #[test]
    fn update_sets_active_worktree_id() {
        let conn = setup_db();
        let project_id = create_project(&conn, "upd-wt");
        let created =
            create(&conn, sample_input(&project_id, "Agent-A")).expect("create should succeed");
        assert_eq!(
            created.active_worktree_id, None,
            "active_worktree_id should be None on create"
        );

        std::thread::sleep(std::time::Duration::from_millis(10));

        let worktree_id = "worktree-xyz-123";
        let updated = update(
            &conn,
            AgentUpdateInput {
                id: created.id.clone(),
                name: None,
                role: None,
                adapter_type: None,
                prompt_path: None,
                config_path: None,
                status: None,
                active_worktree_id: Some(worktree_id.into()),
            },
        )
        .expect("update should succeed");

        assert_eq!(
            updated.active_worktree_id.as_deref(),
            Some(worktree_id),
            "active_worktree_id should be set"
        );

        // 再取得しても保持されていること
        let listed = list_by_project(&conn, &project_id).expect("list should succeed");
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0].active_worktree_id.as_deref(), Some(worktree_id));
    }

    /// 存在しない id で update すると NotFound になること。
    #[test]
    fn update_with_missing_id_returns_not_found() {
        let conn = setup_db();

        let err = update(
            &conn,
            AgentUpdateInput {
                id: "does-not-exist".into(),
                name: Some("X".into()),
                role: None,
                adapter_type: None,
                prompt_path: None,
                config_path: None,
                status: None,
                active_worktree_id: None,
            },
        )
        .expect_err("update with unknown id should fail");

        assert!(
            matches!(err, AppError::NotFound(_)),
            "expected NotFound, got {:?}",
            err
        );
    }

    /// update で None のフィールドは既存値を保持すること。
    #[test]
    fn update_with_none_fields_preserves_existing_values() {
        let conn = setup_db();
        let project_id = create_project(&conn, "upd-none");
        let created = create(
            &conn,
            AgentCreateInput {
                project_id: project_id.clone(),
                name: "Keeper".into(),
                role: Some("designer".into()),
                adapter_type: Some("api".into()),
                prompt_path: Some("/tmp/prompt.md".into()),
                config_path: Some("/tmp/config.json".into()),
                status: Some("running".into()),
            },
        )
        .expect("create should succeed");

        std::thread::sleep(std::time::Duration::from_millis(10));

        // 全フィールド None
        let updated = update(
            &conn,
            AgentUpdateInput {
                id: created.id.clone(),
                name: None,
                role: None,
                adapter_type: None,
                prompt_path: None,
                config_path: None,
                status: None,
                active_worktree_id: None,
            },
        )
        .expect("update should succeed");

        assert_eq!(updated.name, created.name);
        assert_eq!(updated.role, created.role);
        assert_eq!(updated.adapter_type, created.adapter_type);
        assert_eq!(updated.prompt_path, created.prompt_path);
        assert_eq!(updated.config_path, created.config_path);
        assert_eq!(updated.status, created.status);
        assert_eq!(updated.active_worktree_id, created.active_worktree_id);
        assert_eq!(updated.created_at, created.created_at);
        // updated_at のみは更新される
        assert_ne!(updated.updated_at, created.updated_at);
    }
}
