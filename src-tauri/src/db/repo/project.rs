//! `projects` テーブルに対する CRUD 実装。
//!
//! - `create`: uuid v7 を採番し、created_at / updated_at に現在時刻 (ISO8601 UTC) を入れて INSERT
//! - `list`: `ORDER BY updated_at DESC` で全件取得
//! - `update`: 既存行を SELECT → 指定フィールドのみマージ → UPDATE
//!
//! バリデーション方針は `agent-docs/tauri-commands.md` §バリデーション方針に従う。
//! - 空文字 / 空白のみの `name` / `slug` / `root_path` は `InvalidInput`
//! - `slug` は ASCII 英数 + `-` / `_` のみ
//! - UNIQUE 違反 (slug) は `InvalidInput` にマップ
//! - update で対象 id が存在しなければ `NotFound`

use chrono::Utc;
use rusqlite::{params, Connection, ErrorCode, OptionalExtension, Row};
use uuid::Uuid;

use crate::domain::project::{Project, ProjectCreateInput, ProjectUpdateInput};
use crate::error::{AppError, AppResult};

/// `projects` の 1 行を `Project` にマップする共通ヘルパ。
fn row_to_project(row: &Row<'_>) -> rusqlite::Result<Project> {
    Ok(Project {
        id: row.get("id")?,
        name: row.get("name")?,
        slug: row.get("slug")?,
        root_path: row.get("root_path")?,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
    })
}

/// `slug` が ASCII 英数 + `-` / `_` のみから成ることを検証する。
fn is_valid_slug(slug: &str) -> bool {
    !slug.is_empty()
        && slug
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
}

/// `rusqlite::Error` が UNIQUE 制約違反かどうかを判定する。
fn is_unique_violation(err: &rusqlite::Error) -> bool {
    matches!(
        err,
        rusqlite::Error::SqliteFailure(e, _) if e.code == ErrorCode::ConstraintViolation
    )
}

/// Project を作成する。
///
/// 成功時は生成された行 (uuid / created_at / updated_at が埋まった状態) を返す。
///
/// # Errors
///
/// - `name` / `slug` / `root_path` が空白のみなら `InvalidInput`
/// - `slug` に許可外文字が含まれるなら `InvalidInput`
/// - UNIQUE 違反 (slug 重複) なら `InvalidInput`
pub fn create(conn: &Connection, input: ProjectCreateInput) -> AppResult<Project> {
    let name = input.name.trim();
    let slug = input.slug.trim();
    let root_path = input.root_path.trim();

    if name.is_empty() {
        return Err(AppError::InvalidInput("name must not be empty".into()));
    }
    if slug.is_empty() {
        return Err(AppError::InvalidInput("slug must not be empty".into()));
    }
    if !is_valid_slug(slug) {
        return Err(AppError::InvalidInput(
            "slug must contain only ASCII alphanumerics, '-' or '_'".into(),
        ));
    }
    if root_path.is_empty() {
        return Err(AppError::InvalidInput("rootPath must not be empty".into()));
    }

    let id = Uuid::now_v7().to_string();
    let now = Utc::now().to_rfc3339();

    let project = Project {
        id,
        name: name.to_string(),
        slug: slug.to_string(),
        root_path: root_path.to_string(),
        created_at: now.clone(),
        updated_at: now,
    };

    let result = conn.execute(
        "INSERT INTO projects (id, name, slug, root_path, created_at, updated_at) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            project.id,
            project.name,
            project.slug,
            project.root_path,
            project.created_at,
            project.updated_at,
        ],
    );

    match result {
        Ok(_) => Ok(project),
        Err(err) if is_unique_violation(&err) => Err(AppError::InvalidInput(format!(
            "slug already exists: {}",
            project.slug
        ))),
        Err(err) => Err(AppError::from(err)),
    }
}

/// Project を `updated_at DESC` で全件取得する。
pub fn list(conn: &Connection) -> AppResult<Vec<Project>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, slug, root_path, created_at, updated_at \
         FROM projects ORDER BY updated_at DESC",
    )?;

    let rows = stmt.query_map([], row_to_project)?;
    let mut projects = Vec::new();
    for row in rows {
        projects.push(row?);
    }
    Ok(projects)
}

/// 指定 id の Project を取得する (存在しなければ `None`)。
fn find_by_id(conn: &Connection, id: &str) -> AppResult<Option<Project>> {
    let result = conn
        .query_row(
            "SELECT id, name, slug, root_path, created_at, updated_at \
             FROM projects WHERE id = ?1",
            params![id],
            row_to_project,
        )
        .optional()?;
    Ok(result)
}

/// Project を更新する。
///
/// `None` のフィールドは変更せず既存値を保持する。
/// 成功時は更新後の行を返す。
///
/// # Errors
///
/// - 対象 id が存在しなければ `NotFound`
/// - 指定された `name` / `slug` / `root_path` が空白のみなら `InvalidInput`
/// - 指定された `slug` に許可外文字が含まれるなら `InvalidInput`
/// - slug 更新時に UNIQUE 違反が発生したら `InvalidInput`
pub fn update(conn: &Connection, input: ProjectUpdateInput) -> AppResult<Project> {
    let existing = find_by_id(conn, &input.id)?
        .ok_or_else(|| AppError::NotFound(format!("project not found: {}", input.id)))?;

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
    let new_slug = match input.slug {
        Some(v) => {
            let v = v.trim().to_string();
            if v.is_empty() {
                return Err(AppError::InvalidInput("slug must not be empty".into()));
            }
            if !is_valid_slug(&v) {
                return Err(AppError::InvalidInput(
                    "slug must contain only ASCII alphanumerics, '-' or '_'".into(),
                ));
            }
            v
        }
        None => existing.slug.clone(),
    };
    let new_root_path = match input.root_path {
        Some(v) => {
            let v = v.trim().to_string();
            if v.is_empty() {
                return Err(AppError::InvalidInput("rootPath must not be empty".into()));
            }
            v
        }
        None => existing.root_path.clone(),
    };

    let new_updated_at = Utc::now().to_rfc3339();

    let result = conn.execute(
        "UPDATE projects SET name = ?1, slug = ?2, root_path = ?3, updated_at = ?4 \
         WHERE id = ?5",
        params![
            new_name,
            new_slug,
            new_root_path,
            new_updated_at,
            existing.id
        ],
    );

    match result {
        Ok(_) => Ok(Project {
            id: existing.id,
            name: new_name,
            slug: new_slug,
            root_path: new_root_path,
            created_at: existing.created_at,
            updated_at: new_updated_at,
        }),
        Err(err) if is_unique_violation(&err) => Err(AppError::InvalidInput(format!(
            "slug already exists: {}",
            new_slug
        ))),
        Err(err) => Err(AppError::from(err)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::connection::open_in_memory;
    use crate::db::migration::run_pending;

    /// テスト用に `:memory:` DB を立ち上げて全マイグレーションを適用する。
    fn setup_db() -> Connection {
        let mut conn = open_in_memory().expect("open_in_memory should succeed");
        run_pending(&mut conn).expect("run_pending should succeed");
        conn
    }

    fn sample_input(slug: &str) -> ProjectCreateInput {
        ProjectCreateInput {
            name: format!("Project {}", slug),
            slug: slug.to_string(),
            root_path: format!("/tmp/{}", slug),
        }
    }

    /// create → list で 1 件返ること。
    #[test]
    fn create_then_list_returns_one_project() {
        let conn = setup_db();

        let created = create(&conn, sample_input("alpha")).expect("create should succeed");
        assert!(!created.id.is_empty(), "id should be generated");
        assert_eq!(created.name, "Project alpha");
        assert_eq!(created.slug, "alpha");
        assert_eq!(created.root_path, "/tmp/alpha");
        assert!(!created.created_at.is_empty());
        assert_eq!(
            created.created_at, created.updated_at,
            "on create, created_at and updated_at should match"
        );

        let listed = list(&conn).expect("list should succeed");
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0], created);
    }

    /// create → update (name 変更) → list で name 変更が反映されていること。
    #[test]
    fn update_name_is_reflected_in_list() {
        let conn = setup_db();

        let created = create(&conn, sample_input("beta")).expect("create should succeed");

        // 同じ秒に updated_at が潰れないよう、ごく短い sleep を置く
        std::thread::sleep(std::time::Duration::from_millis(10));

        let updated = update(
            &conn,
            ProjectUpdateInput {
                id: created.id.clone(),
                name: Some("Renamed Beta".into()),
                slug: None,
                root_path: None,
            },
        )
        .expect("update should succeed");

        assert_eq!(updated.id, created.id);
        assert_eq!(updated.name, "Renamed Beta");
        assert_eq!(updated.slug, created.slug, "slug should be preserved");
        assert_eq!(
            updated.root_path, created.root_path,
            "root_path should be preserved"
        );
        assert_eq!(
            updated.created_at, created.created_at,
            "created_at should not change"
        );
        assert_ne!(
            updated.updated_at, created.updated_at,
            "updated_at should advance"
        );

        let listed = list(&conn).expect("list should succeed");
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0].name, "Renamed Beta");
    }

    /// 重複 slug で create すると `InvalidInput` になること。
    #[test]
    fn create_with_duplicate_slug_returns_invalid_input() {
        let conn = setup_db();

        create(&conn, sample_input("gamma")).expect("first create should succeed");

        let err = create(
            &conn,
            ProjectCreateInput {
                name: "Another".into(),
                slug: "gamma".into(),
                root_path: "/tmp/gamma2".into(),
            },
        )
        .expect_err("duplicate slug should fail");

        assert!(
            matches!(err, AppError::InvalidInput(_)),
            "expected InvalidInput, got {:?}",
            err
        );
    }

    /// 存在しない id で update すると `NotFound` になること。
    #[test]
    fn update_with_missing_id_returns_not_found() {
        let conn = setup_db();

        let err = update(
            &conn,
            ProjectUpdateInput {
                id: "does-not-exist".into(),
                name: Some("X".into()),
                slug: None,
                root_path: None,
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

        let created = create(&conn, sample_input("delta")).expect("create should succeed");

        std::thread::sleep(std::time::Duration::from_millis(10));

        // 全フィールド None の update
        let updated = update(
            &conn,
            ProjectUpdateInput {
                id: created.id.clone(),
                name: None,
                slug: None,
                root_path: None,
            },
        )
        .expect("update should succeed");

        assert_eq!(updated.name, created.name);
        assert_eq!(updated.slug, created.slug);
        assert_eq!(updated.root_path, created.root_path);
        assert_eq!(updated.created_at, created.created_at);
        // updated_at のみは更新される
        assert_ne!(updated.updated_at, created.updated_at);
    }

    /// list は `updated_at DESC` で並ぶこと。
    #[test]
    fn list_orders_by_updated_at_desc() {
        let conn = setup_db();

        let first = create(&conn, sample_input("first")).expect("create should succeed");
        std::thread::sleep(std::time::Duration::from_millis(10));
        let second = create(&conn, sample_input("second")).expect("create should succeed");
        std::thread::sleep(std::time::Duration::from_millis(10));
        let third = create(&conn, sample_input("third")).expect("create should succeed");

        let listed = list(&conn).expect("list should succeed");
        assert_eq!(listed.len(), 3);
        // 直近 create した順で並ぶ (updated_at DESC)
        assert_eq!(listed[0].id, third.id);
        assert_eq!(listed[1].id, second.id);
        assert_eq!(listed[2].id, first.id);
    }

    /// 空文字の name / slug / root_path は InvalidInput になること。
    #[test]
    fn create_with_empty_fields_returns_invalid_input() {
        let conn = setup_db();

        let err = create(
            &conn,
            ProjectCreateInput {
                name: "   ".into(),
                slug: "ok".into(),
                root_path: "/tmp/ok".into(),
            },
        )
        .expect_err("empty name should fail");
        assert!(matches!(err, AppError::InvalidInput(_)));

        let err = create(
            &conn,
            ProjectCreateInput {
                name: "ok".into(),
                slug: "".into(),
                root_path: "/tmp/ok".into(),
            },
        )
        .expect_err("empty slug should fail");
        assert!(matches!(err, AppError::InvalidInput(_)));

        let err = create(
            &conn,
            ProjectCreateInput {
                name: "ok".into(),
                slug: "bad slug!".into(),
                root_path: "/tmp/ok".into(),
            },
        )
        .expect_err("invalid slug chars should fail");
        assert!(matches!(err, AppError::InvalidInput(_)));

        let err = create(
            &conn,
            ProjectCreateInput {
                name: "ok".into(),
                slug: "ok".into(),
                root_path: "".into(),
            },
        )
        .expect_err("empty root_path should fail");
        assert!(matches!(err, AppError::InvalidInput(_)));
    }
}
