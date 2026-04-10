//! `worktrees` テーブルに対する CRUD 実装。
//!
//! - `create`: project_id の存在チェック → uuid v7 を採番し、created_at / updated_at に
//!   現在時刻 (ISO8601 UTC) を入れて INSERT
//! - `list_by_project`: `WHERE project_id = ? ORDER BY updated_at DESC` で取得 (存在しない
//!   project_id でも空 Vec を返す)
//! - `update`: 既存行を SELECT → 指定フィールドのみマージ → UPDATE
//!
//! バリデーション方針:
//! - `branch_name` / `path` が空白のみなら `InvalidInput`
//! - `base_branch` は未指定時に `"main"`、`status` は未指定時に `"ready"` を適用
//! - project_id が存在しなければ `NotFound`
//! - update 対象 id が存在しなければ `NotFound`
//!
//! 注意: `agent_id` は nullable。循環参照回避のため `agents` に対する
//! 存在チェックは行わない (db-schema.md §worktrees の「論理参照」方針)。
//!
//! 参照: `agent-docs/tauri-commands.md`, `agent-docs/db-schema.md`

use chrono::Utc;
use rusqlite::{params, Connection, OptionalExtension, Row};
use std::path::Path;
use uuid::Uuid;

use crate::domain::worktree::{Worktree, WorktreeCreateInput, WorktreeUpdateInput};
use crate::error::{AppError, AppResult};

/// `worktrees` の 1 行を `Worktree` にマップする共通ヘルパ。
fn row_to_worktree(row: &Row<'_>) -> rusqlite::Result<Worktree> {
    Ok(Worktree {
        id: row.get("id")?,
        project_id: row.get("project_id")?,
        agent_id: row.get("agent_id")?,
        branch_name: row.get("branch_name")?,
        path: row.get("path")?,
        base_branch: row.get("base_branch")?,
        status: row.get("status")?,
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

fn validate_worktree_path(path: &str) -> AppResult<()> {
    let root = Path::new(path);
    if !root.exists() {
        return Err(AppError::InvalidInput(format!(
            "worktree path does not exist: {}",
            path
        )));
    }
    if !root.is_dir() {
        return Err(AppError::InvalidInput(format!(
            "worktree path is not a directory: {}",
            path
        )));
    }
    Ok(())
}

/// Worktree を作成する。
///
/// 成功時は生成された行 (uuid / created_at / updated_at が埋まった状態) を返す。
///
/// # Errors
///
/// - `project_id` / `branch_name` / `path` が空白のみなら `InvalidInput`
/// - `project_id` に対応する行が存在しなければ `NotFound`
pub fn create(conn: &Connection, input: WorktreeCreateInput) -> AppResult<Worktree> {
    let project_id = input.project_id.trim();
    let branch_name = input.branch_name.trim();
    let path = input.path.trim();

    if project_id.is_empty() {
        return Err(AppError::InvalidInput("projectId must not be empty".into()));
    }
    if branch_name.is_empty() {
        return Err(AppError::InvalidInput(
            "branchName must not be empty".into(),
        ));
    }
    if path.is_empty() {
        return Err(AppError::InvalidInput("path must not be empty".into()));
    }
    validate_worktree_path(path)?;

    if !project_exists(conn, project_id)? {
        return Err(AppError::NotFound(format!(
            "project not found: {}",
            project_id
        )));
    }

    // デフォルト値の適用 (db-schema.md の DEFAULT と揃える)
    let base_branch = input
        .base_branch
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "main".to_string());
    let status = input
        .status
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "ready".to_string());

    let id = Uuid::now_v7().to_string();
    let now = Utc::now().to_rfc3339();

    let worktree = Worktree {
        id,
        project_id: project_id.to_string(),
        agent_id: input.agent_id,
        branch_name: branch_name.to_string(),
        path: path.to_string(),
        base_branch,
        status,
        created_at: now.clone(),
        updated_at: now,
    };

    conn.execute(
        "INSERT INTO worktrees (\
             id, project_id, agent_id, branch_name, path, \
             base_branch, status, created_at, updated_at\
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            worktree.id,
            worktree.project_id,
            worktree.agent_id,
            worktree.branch_name,
            worktree.path,
            worktree.base_branch,
            worktree.status,
            worktree.created_at,
            worktree.updated_at,
        ],
    )?;

    Ok(worktree)
}

/// 指定 project_id に紐付く Worktree を `updated_at DESC` で取得する。
///
/// 存在しない project_id であってもエラーとせず、空 Vec を返す。
pub fn list_by_project(conn: &Connection, project_id: &str) -> AppResult<Vec<Worktree>> {
    let mut stmt = conn.prepare(
        "SELECT id, project_id, agent_id, branch_name, path, \
                base_branch, status, created_at, updated_at \
         FROM worktrees \
         WHERE project_id = ?1 \
         ORDER BY updated_at DESC",
    )?;

    let rows = stmt.query_map(params![project_id], row_to_worktree)?;
    let mut worktrees = Vec::new();
    for row in rows {
        worktrees.push(row?);
    }
    Ok(worktrees)
}

/// 指定 id の Worktree を取得する。存在しない場合は `None` を返す。
pub fn get_by_id(conn: &Connection, id: &str) -> AppResult<Option<Worktree>> {
    find_by_id(conn, id)
}

/// 指定 id の Worktree を取得する (存在しなければ `None`)。
fn find_by_id(conn: &Connection, id: &str) -> AppResult<Option<Worktree>> {
    let result = conn
        .query_row(
            "SELECT id, project_id, agent_id, branch_name, path, \
                    base_branch, status, created_at, updated_at \
             FROM worktrees WHERE id = ?1",
            params![id],
            row_to_worktree,
        )
        .optional()?;
    Ok(result)
}

/// Worktree を更新する。
///
/// `None` のフィールドは変更せず既存値を保持する。
/// 成功時は更新後の行を返す。
///
/// # Errors
///
/// - 対象 id が存在しなければ `NotFound`
/// - 指定された `branch_name` / `path` が空白のみなら `InvalidInput`
pub fn update(conn: &Connection, input: WorktreeUpdateInput) -> AppResult<Worktree> {
    let existing = find_by_id(conn, &input.id)?
        .ok_or_else(|| AppError::NotFound(format!("worktree not found: {}", input.id)))?;

    // マージ: None のフィールドは既存値を保持
    let new_agent_id = match input.agent_id {
        Some(v) => Some(v),
        None => existing.agent_id.clone(),
    };
    let new_branch_name = match input.branch_name {
        Some(v) => {
            let v = v.trim().to_string();
            if v.is_empty() {
                return Err(AppError::InvalidInput(
                    "branchName must not be empty".into(),
                ));
            }
            v
        }
        None => existing.branch_name.clone(),
    };
    let new_path = match input.path {
        Some(v) => {
            let v = v.trim().to_string();
            if v.is_empty() {
                return Err(AppError::InvalidInput("path must not be empty".into()));
            }
            validate_worktree_path(&v)?;
            v
        }
        None => existing.path.clone(),
    };
    let new_base_branch = input
        .base_branch
        .unwrap_or_else(|| existing.base_branch.clone());
    let new_status = input.status.unwrap_or_else(|| existing.status.clone());

    let new_updated_at = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE worktrees SET \
             agent_id = ?1, \
             branch_name = ?2, \
             path = ?3, \
             base_branch = ?4, \
             status = ?5, \
             updated_at = ?6 \
         WHERE id = ?7",
        params![
            new_agent_id,
            new_branch_name,
            new_path,
            new_base_branch,
            new_status,
            new_updated_at,
            existing.id,
        ],
    )?;

    Ok(Worktree {
        id: existing.id,
        project_id: existing.project_id,
        agent_id: new_agent_id,
        branch_name: new_branch_name,
        path: new_path,
        base_branch: new_base_branch,
        status: new_status,
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
    use std::fs;
    use std::path::PathBuf;
    use uuid::Uuid;

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

    fn sample_input(project_id: &str, branch_name: &str) -> WorktreeCreateInput {
        WorktreeCreateInput {
            project_id: project_id.to_string(),
            agent_id: None,
            branch_name: branch_name.to_string(),
            path: make_temp_dir(&format!("worktree-{}", branch_name.replace('/', "-"))),
            base_branch: None,
            status: None,
        }
    }

    fn make_temp_dir(label: &str) -> String {
        let path = std::env::temp_dir().join(format!("quietmem-{}-{}", label, Uuid::now_v7()));
        fs::create_dir_all(&path).expect("temp dir should be created");
        path.to_string_lossy().to_string()
    }

    /// create → list_by_project で 1 件返り、デフォルト値が適用されること。
    #[test]
    fn create_then_list_by_project_returns_one_worktree() {
        let conn = setup_db();
        let project_id = create_project(&conn, "alpha");

        let created = create(&conn, sample_input(&project_id, "feature/alpha"))
            .expect("create should succeed");

        assert!(!created.id.is_empty(), "id should be generated");
        assert_eq!(created.project_id, project_id);
        assert_eq!(created.branch_name, "feature/alpha");
        assert!(
            PathBuf::from(&created.path).exists(),
            "created path should exist during test"
        );
        assert_eq!(
            created.base_branch, "main",
            "base_branch default should be 'main'"
        );
        assert_eq!(created.status, "ready", "status default should be 'ready'");
        assert_eq!(created.agent_id, None);
        assert!(!created.created_at.is_empty());
        assert_eq!(
            created.created_at, created.updated_at,
            "on create, created_at and updated_at should match"
        );

        let listed = list_by_project(&conn, &project_id).expect("list should succeed");
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0], created);
    }

    /// 指定した base_branch / status / agent_id が保存されること。
    #[test]
    fn create_accepts_explicit_base_branch_status_and_agent() {
        let conn = setup_db();
        let project_id = create_project(&conn, "explicit");

        let created = create(
            &conn,
            WorktreeCreateInput {
                project_id: project_id.clone(),
                agent_id: Some("agent-abc-123".into()),
                branch_name: "release/1.0".into(),
                path: make_temp_dir("release-1"),
                base_branch: Some("develop".into()),
                status: Some("active".into()),
            },
        )
        .expect("create should succeed");

        assert_eq!(created.base_branch, "develop");
        assert_eq!(created.status, "active");
        assert_eq!(created.agent_id.as_deref(), Some("agent-abc-123"));
    }

    /// 存在しない project_id で create すると NotFound になること。
    #[test]
    fn create_with_missing_project_returns_not_found() {
        let conn = setup_db();

        let err = create(&conn, sample_input("does-not-exist-project", "feature/x"))
            .expect_err("create with unknown project should fail");

        assert!(
            matches!(err, AppError::NotFound(_)),
            "expected NotFound, got {:?}",
            err
        );
    }

    /// 空文字の branch_name で create すると InvalidInput になること。
    #[test]
    fn create_with_empty_branch_name_returns_invalid_input() {
        let conn = setup_db();
        let project_id = create_project(&conn, "empty-branch");

        let err = create(
            &conn,
            WorktreeCreateInput {
                project_id,
                agent_id: None,
                branch_name: "   ".into(),
                path: "/tmp/worktrees/x".into(),
                base_branch: None,
                status: None,
            },
        )
        .expect_err("empty branch_name should fail");

        assert!(
            matches!(err, AppError::InvalidInput(_)),
            "expected InvalidInput, got {:?}",
            err
        );
    }

    /// 実在しない path で create すると InvalidInput になること。
    #[test]
    fn create_with_missing_path_returns_invalid_input() {
        let conn = setup_db();
        let project_id = create_project(&conn, "missing-path");

        let err = create(
            &conn,
            WorktreeCreateInput {
                project_id,
                agent_id: None,
                branch_name: "feature/x".into(),
                path: "/definitely/not/a/real/quietmem/worktree".into(),
                base_branch: None,
                status: None,
            },
        )
        .expect_err("missing path should fail");

        assert!(
            matches!(err, AppError::InvalidInput(_)),
            "expected InvalidInput, got {:?}",
            err
        );
    }

    /// 空文字の path で create すると InvalidInput になること。
    #[test]
    fn create_with_empty_path_returns_invalid_input() {
        let conn = setup_db();
        let project_id = create_project(&conn, "empty-path");

        let err = create(
            &conn,
            WorktreeCreateInput {
                project_id,
                agent_id: None,
                branch_name: "feature/x".into(),
                path: "   ".into(),
                base_branch: None,
                status: None,
            },
        )
        .expect_err("empty path should fail");

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
            create(&conn, sample_input(&project_a, "a-first")).expect("create should succeed");
        std::thread::sleep(std::time::Duration::from_millis(10));
        let a_second =
            create(&conn, sample_input(&project_a, "a-second")).expect("create should succeed");
        std::thread::sleep(std::time::Duration::from_millis(10));
        let _b_only =
            create(&conn, sample_input(&project_b, "b-only")).expect("create should succeed");

        let listed_a = list_by_project(&conn, &project_a).expect("list should succeed");
        assert_eq!(
            listed_a.len(),
            2,
            "project_a should have exactly 2 worktrees"
        );
        // 直近 create した順で並ぶ (updated_at DESC)
        assert_eq!(listed_a[0].id, a_second.id);
        assert_eq!(listed_a[1].id, a_first.id);

        let listed_b = list_by_project(&conn, &project_b).expect("list should succeed");
        assert_eq!(
            listed_b.len(),
            1,
            "project_b should have exactly 1 worktree"
        );
    }

    /// update で branch_name / status を変更できること。
    #[test]
    fn update_branch_name_and_status() {
        let conn = setup_db();
        let project_id = create_project(&conn, "upd-branch");
        let created =
            create(&conn, sample_input(&project_id, "feature/old")).expect("create should succeed");

        std::thread::sleep(std::time::Duration::from_millis(10));

        let updated = update(
            &conn,
            WorktreeUpdateInput {
                id: created.id.clone(),
                agent_id: None,
                branch_name: Some("feature/new".into()),
                path: None,
                base_branch: None,
                status: Some("in_use".into()),
            },
        )
        .expect("update should succeed");

        assert_eq!(updated.id, created.id);
        assert_eq!(updated.branch_name, "feature/new");
        assert_eq!(updated.status, "in_use");
        assert_eq!(updated.path, created.path, "path should be preserved");
        assert_eq!(
            updated.base_branch, created.base_branch,
            "base_branch should be preserved"
        );
        assert_eq!(
            updated.created_at, created.created_at,
            "created_at should not change"
        );
        assert_ne!(
            updated.updated_at, created.updated_at,
            "updated_at should advance"
        );
    }

    /// update で agent_id を設定できること (紐付けシナリオ)。
    #[test]
    fn update_sets_agent_id() {
        let conn = setup_db();
        let project_id = create_project(&conn, "upd-agent");
        let created = create(&conn, sample_input(&project_id, "feature/bind"))
            .expect("create should succeed");
        assert_eq!(
            created.agent_id, None,
            "agent_id should be None on create by default"
        );

        std::thread::sleep(std::time::Duration::from_millis(10));

        let agent_id = "agent-xyz-789";
        let updated = update(
            &conn,
            WorktreeUpdateInput {
                id: created.id.clone(),
                agent_id: Some(agent_id.into()),
                branch_name: None,
                path: None,
                base_branch: None,
                status: None,
            },
        )
        .expect("update should succeed");

        assert_eq!(
            updated.agent_id.as_deref(),
            Some(agent_id),
            "agent_id should be set"
        );

        // 再取得しても保持されていること
        let listed = list_by_project(&conn, &project_id).expect("list should succeed");
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0].agent_id.as_deref(), Some(agent_id));
    }

    /// 存在しない id で update すると NotFound になること。
    #[test]
    fn update_with_missing_id_returns_not_found() {
        let conn = setup_db();

        let err = update(
            &conn,
            WorktreeUpdateInput {
                id: "does-not-exist".into(),
                agent_id: None,
                branch_name: Some("feature/x".into()),
                path: None,
                base_branch: None,
                status: None,
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
            WorktreeCreateInput {
                project_id: project_id.clone(),
                agent_id: Some("agent-keeper".into()),
                branch_name: "feature/keep".into(),
                path: make_temp_dir("keep"),
                base_branch: Some("develop".into()),
                status: Some("active".into()),
            },
        )
        .expect("create should succeed");

        std::thread::sleep(std::time::Duration::from_millis(10));

        // 全フィールド None
        let updated = update(
            &conn,
            WorktreeUpdateInput {
                id: created.id.clone(),
                agent_id: None,
                branch_name: None,
                path: None,
                base_branch: None,
                status: None,
            },
        )
        .expect("update should succeed");

        assert_eq!(updated.agent_id, created.agent_id);
        assert_eq!(updated.branch_name, created.branch_name);
        assert_eq!(updated.path, created.path);
        assert_eq!(updated.base_branch, created.base_branch);
        assert_eq!(updated.status, created.status);
        assert_eq!(updated.created_at, created.created_at);
        // updated_at のみは更新される
        assert_ne!(updated.updated_at, created.updated_at);
    }

    /// update で空文字の branch_name を渡すと InvalidInput になること。
    #[test]
    fn update_with_empty_branch_name_returns_invalid_input() {
        let conn = setup_db();
        let project_id = create_project(&conn, "upd-empty-br");
        let created = create(&conn, sample_input(&project_id, "feature/keep"))
            .expect("create should succeed");

        let err = update(
            &conn,
            WorktreeUpdateInput {
                id: created.id,
                agent_id: None,
                branch_name: Some("   ".into()),
                path: None,
                base_branch: None,
                status: None,
            },
        )
        .expect_err("empty branch_name in update should fail");

        assert!(
            matches!(err, AppError::InvalidInput(_)),
            "expected InvalidInput, got {:?}",
            err
        );
    }

    /// update で実在しない path を渡すと InvalidInput になること。
    #[test]
    fn update_with_missing_path_returns_invalid_input() {
        let conn = setup_db();
        let project_id = create_project(&conn, "upd-missing-path");
        let created = create(&conn, sample_input(&project_id, "feature/keep"))
            .expect("create should succeed");

        let err = update(
            &conn,
            WorktreeUpdateInput {
                id: created.id,
                agent_id: None,
                branch_name: None,
                path: Some("/definitely/not/a/real/quietmem/worktree".into()),
                base_branch: None,
                status: None,
            },
        )
        .expect_err("missing path in update should fail");

        assert!(
            matches!(err, AppError::InvalidInput(_)),
            "expected InvalidInput, got {:?}",
            err
        );
    }
}
