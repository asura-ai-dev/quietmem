//! Worktree 関連の Tauri commands。
//!
//! CRUD に加え、QTM-004B では active worktree から file tree source を取得する。

use std::fs;
use std::path::{Path, PathBuf};

use tauri::State;

use crate::app_state::AppState;
use crate::db;
use crate::domain::file_tree::{
    FileTreeNode, FileTreeNodeKind, WorktreeFileContent, WorktreeFileSaveInput,
    WorktreeTreeSource,
};
use crate::domain::worktree::{Worktree, WorktreeCreateInput, WorktreeUpdateInput};
use crate::error::{AppError, AppResult};

const EXCLUDED_DIRECTORY_NAMES: &[&str] = &[".git", "node_modules", "dist", "target"];

/// Worktree を作成する。
#[tauri::command(rename_all = "camelCase")]
pub fn worktree_create(
    state: State<'_, AppState>,
    input: WorktreeCreateInput,
) -> AppResult<Worktree> {
    state.with_conn(|conn| db::repo::worktree::create(conn, input))
}

/// 指定 project に紐付く Worktree を `updated_at DESC` で取得する。
#[tauri::command(rename_all = "camelCase")]
pub fn worktree_list_by_project(
    state: State<'_, AppState>,
    project_id: String,
) -> AppResult<Vec<Worktree>> {
    state.with_conn(|conn| db::repo::worktree::list_by_project(conn, &project_id))
}

/// Worktree を更新する。
#[tauri::command(rename_all = "camelCase")]
pub fn worktree_update(
    state: State<'_, AppState>,
    input: WorktreeUpdateInput,
) -> AppResult<Worktree> {
    state.with_conn(|conn| db::repo::worktree::update(conn, input))
}

/// 指定 worktree の file tree source を返す。
///
/// QTM-004B では file open/save までは扱わず、active worktree に紐づくルートから
/// 非表示対象を除外した階層データのみを返す。
#[tauri::command(rename_all = "camelCase")]
pub fn worktree_get_file_tree(
    state: State<'_, AppState>,
    worktree_id: String,
) -> AppResult<WorktreeTreeSource> {
    state.with_conn(|conn| load_file_tree_for_worktree(conn, &worktree_id))
}

/// 指定 worktree 配下のテキストファイル内容を返す。
#[tauri::command(rename_all = "camelCase")]
pub fn worktree_get_file_content(
    state: State<'_, AppState>,
    worktree_id: String,
    relative_path: String,
) -> AppResult<WorktreeFileContent> {
    state.with_conn(|conn| load_file_content_for_worktree(conn, &worktree_id, &relative_path))
}

/// 指定 worktree 配下の既存テキストファイルへ内容を書き戻す。
#[tauri::command(rename_all = "camelCase")]
pub fn worktree_save_file_content(
    state: State<'_, AppState>,
    input: WorktreeFileSaveInput,
) -> AppResult<WorktreeFileContent> {
    state.with_conn(|conn| {
        save_file_content_for_worktree(
            conn,
            &input.worktree_id,
            &input.relative_path,
            &input.content,
        )
    })
}

fn resolve_worktree_root(conn: &rusqlite::Connection, worktree_id: &str) -> AppResult<Worktree> {
    let worktree = db::repo::worktree::get_by_id(conn, worktree_id)?
        .ok_or_else(|| AppError::NotFound(format!("worktree not found: {}", worktree_id)))?;

    let root = PathBuf::from(&worktree.path);
    if !root.exists() {
        return Err(AppError::NotFound(format!(
            "worktree root does not exist: {}",
            worktree.path
        )));
    }
    if !root.is_dir() {
        return Err(AppError::InvalidInput(format!(
            "worktree root is not a directory: {}",
            worktree.path
        )));
    }

    Ok(worktree)
}

fn load_file_tree_for_worktree(
    conn: &rusqlite::Connection,
    worktree_id: &str,
) -> AppResult<WorktreeTreeSource> {
    let worktree = resolve_worktree_root(conn, worktree_id)?;
    let root = PathBuf::from(&worktree.path);

    let nodes = collect_tree_nodes(&root, &root)?;
    Ok(WorktreeTreeSource {
        worktree_id: worktree.id,
        root_path: worktree.path,
        nodes,
    })
}

fn load_file_content_for_worktree(
    conn: &rusqlite::Connection,
    worktree_id: &str,
    relative_path: &str,
) -> AppResult<WorktreeFileContent> {
    let (worktree, safe_relative, canonical_file) =
        resolve_worktree_file_path(conn, worktree_id, relative_path)?;

    let bytes = fs::read(&canonical_file)?;
    let content = String::from_utf8(bytes).map_err(|_| {
        AppError::InvalidInput(format!(
            "only UTF-8 text files are supported: {}",
            relative_path
        ))
    })?;

    Ok(WorktreeFileContent {
        worktree_id: worktree.id,
        relative_path: safe_relative,
        content,
    })
}

fn save_file_content_for_worktree(
    conn: &rusqlite::Connection,
    worktree_id: &str,
    relative_path: &str,
    content: &str,
) -> AppResult<WorktreeFileContent> {
    let (worktree, safe_relative, canonical_file) =
        resolve_worktree_file_path(conn, worktree_id, relative_path)?;

    fs::write(&canonical_file, content.as_bytes())?;

    Ok(WorktreeFileContent {
        worktree_id: worktree.id,
        relative_path: safe_relative,
        content: content.to_string(),
    })
}

fn resolve_worktree_file_path(
    conn: &rusqlite::Connection,
    worktree_id: &str,
    relative_path: &str,
) -> AppResult<(Worktree, String, PathBuf)> {
    let worktree = resolve_worktree_root(conn, worktree_id)?;
    let root = PathBuf::from(&worktree.path);
    let canonical_root = root.canonicalize()?;
    let safe_relative = sanitize_relative_file_path(relative_path)?;
    let full_path = canonical_root.join(&safe_relative);

    if !full_path.exists() {
        return Err(AppError::NotFound(format!(
            "file not found in worktree: {}",
            relative_path
        )));
    }
    if !full_path.is_file() {
        return Err(AppError::InvalidInput(format!(
            "path is not a file: {}",
            relative_path
        )));
    }

    let canonical_file = full_path.canonicalize()?;
    if !canonical_file.starts_with(&canonical_root) {
        return Err(AppError::InvalidInput(format!(
            "path escapes worktree root: {}",
            relative_path
        )));
    }

    Ok((worktree, safe_relative, canonical_file))
}

fn collect_tree_nodes(root: &Path, current: &Path) -> AppResult<Vec<FileTreeNode>> {
    let mut entries = Vec::new();

    for entry in fs::read_dir(current)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let name = entry.file_name().to_string_lossy().to_string();
        if should_skip_entry(&name, file_type.is_dir()) {
            continue;
        }

        let path = entry.path();
        let relative_path = path
            .strip_prefix(root)
            .map_err(|err| AppError::Internal(format!("strip_prefix failed: {}", err)))?
            .to_string_lossy()
            .replace('\\', "/");

        if file_type.is_dir() {
            entries.push(FileTreeNode {
                name,
                relative_path,
                kind: FileTreeNodeKind::Directory,
                children: collect_tree_nodes(root, &path)?,
            });
            continue;
        }

        if file_type.is_file() {
            entries.push(FileTreeNode {
                name,
                relative_path,
                kind: FileTreeNodeKind::File,
                children: Vec::new(),
            });
        }
    }

    entries.sort_by(|left, right| match (left.kind, right.kind) {
        (FileTreeNodeKind::Directory, FileTreeNodeKind::File) => std::cmp::Ordering::Less,
        (FileTreeNodeKind::File, FileTreeNodeKind::Directory) => std::cmp::Ordering::Greater,
        _ => left
            .name
            .to_ascii_lowercase()
            .cmp(&right.name.to_ascii_lowercase()),
    });

    Ok(entries)
}

fn should_skip_entry(name: &str, is_dir: bool) -> bool {
    if name.starts_with('.') {
        return true;
    }

    is_dir && EXCLUDED_DIRECTORY_NAMES.contains(&name)
}

fn sanitize_relative_file_path(relative_path: &str) -> AppResult<String> {
    let input = Path::new(relative_path);
    if input.as_os_str().is_empty() {
        return Err(AppError::InvalidInput("relative path is empty".into()));
    }

    let mut segments = Vec::new();
    for component in input.components() {
        match component {
            std::path::Component::Normal(segment) => {
                segments.push(segment.to_string_lossy().to_string());
            }
            std::path::Component::CurDir => continue,
            _ => {
                return Err(AppError::InvalidInput(format!(
                    "invalid relative file path: {}",
                    relative_path
                )));
            }
        }
    }

    if segments.is_empty() {
        return Err(AppError::InvalidInput(format!(
            "invalid relative file path: {}",
            relative_path
        )));
    }

    Ok(segments.join("/"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::connection::open_in_memory;
    use crate::db::migration::run_pending;
    use crate::db::repo::project as project_repo;
    use crate::db::repo::worktree as worktree_repo;
    use crate::domain::project::ProjectCreateInput;
    use crate::domain::worktree::WorktreeCreateInput;
    use uuid::Uuid;

    fn setup_db() -> rusqlite::Connection {
        let mut conn = open_in_memory().expect("open_in_memory should succeed");
        run_pending(&mut conn).expect("run_pending should succeed");
        conn
    }

    fn create_project(conn: &rusqlite::Connection) -> String {
        let suffix = Uuid::now_v7().to_string();
        project_repo::create(
            conn,
            ProjectCreateInput {
                name: format!("Project {}", suffix),
                slug: format!("project-{}", suffix),
                root_path: format!("/tmp/{}", suffix),
            },
        )
        .expect("create project should succeed")
        .id
    }

    fn make_temp_dir() -> PathBuf {
        let dir = std::env::temp_dir().join(format!("quietmem-tree-{}", Uuid::now_v7()));
        fs::create_dir_all(&dir).expect("temp dir should be created");
        dir
    }

    #[test]
    fn file_tree_source_filters_hidden_and_sorts_directories_first() {
        let conn = setup_db();
        let project_id = create_project(&conn);
        let root = make_temp_dir();

        fs::create_dir_all(root.join("src/nested")).expect("src/nested should exist");
        fs::create_dir_all(root.join(".git")).expect(".git should exist");
        fs::create_dir_all(root.join("node_modules/pkg")).expect("node_modules should exist");
        fs::write(root.join("README.md"), "# readme\n").expect("README should exist");
        fs::write(root.join("src/lib.rs"), "fn main() {}\n").expect("src/lib.rs");
        fs::write(root.join(".env"), "SECRET=1\n").expect(".env should exist");

        let worktree = worktree_repo::create(
            &conn,
            WorktreeCreateInput {
                project_id,
                agent_id: Some("agent-1".into()),
                branch_name: "feature/tree".into(),
                path: root.to_string_lossy().to_string(),
                base_branch: None,
                status: None,
            },
        )
        .expect("worktree create should succeed");

        let result =
            load_file_tree_for_worktree(&conn, &worktree.id).expect("tree source should load");

        assert_eq!(result.worktree_id, worktree.id);
        assert_eq!(result.nodes.len(), 2, "hidden and excluded entries are omitted");
        assert_eq!(result.nodes[0].name, "src", "directories sort before files");
        assert_eq!(result.nodes[1].name, "README.md");
        assert_eq!(result.nodes[0].children.len(), 2);
        assert_eq!(result.nodes[0].children[0].name, "nested");
        assert_eq!(result.nodes[0].children[1].name, "lib.rs");

        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn file_tree_source_returns_not_found_when_root_is_missing() {
        let conn = setup_db();
        let project_id = create_project(&conn);
        let root = make_temp_dir();

        let worktree = worktree_repo::create(
            &conn,
            WorktreeCreateInput {
                project_id,
                agent_id: None,
                branch_name: "feature/missing".into(),
                path: root.to_string_lossy().to_string(),
                base_branch: None,
                status: None,
            },
        )
        .expect("worktree create should succeed");

        let _ = fs::remove_dir_all(&root);

        let err = load_file_tree_for_worktree(&conn, &worktree.id)
            .expect_err("missing directory should return error");
        assert!(matches!(err, AppError::NotFound(_)));
    }

    #[test]
    fn worktree_file_content_reads_utf8_text_file() {
        let conn = setup_db();
        let project_id = create_project(&conn);
        let root = make_temp_dir();
        fs::create_dir_all(root.join("src")).expect("src should exist");
        fs::write(root.join("src/lib.rs"), "pub fn meaning() -> i32 { 42 }\n")
            .expect("src/lib.rs should exist");

        let worktree = worktree_repo::create(
            &conn,
            WorktreeCreateInput {
                project_id,
                agent_id: Some("agent-1".into()),
                branch_name: "feature/open".into(),
                path: root.to_string_lossy().to_string(),
                base_branch: None,
                status: None,
            },
        )
        .expect("worktree create should succeed");

        let result = load_file_content_for_worktree(&conn, &worktree.id, "src/lib.rs")
            .expect("file content should load");

        assert_eq!(result.worktree_id, worktree.id);
        assert_eq!(result.relative_path, "src/lib.rs");
        assert_eq!(result.content, "pub fn meaning() -> i32 { 42 }\n");

        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn worktree_file_content_rejects_path_escape() {
        let conn = setup_db();
        let project_id = create_project(&conn);
        let root = make_temp_dir();

        let worktree = worktree_repo::create(
            &conn,
            WorktreeCreateInput {
                project_id,
                agent_id: None,
                branch_name: "feature/escape".into(),
                path: root.to_string_lossy().to_string(),
                base_branch: None,
                status: None,
            },
        )
        .expect("worktree create should succeed");

        let err = load_file_content_for_worktree(&conn, &worktree.id, "../secret.txt")
            .expect_err("path escape should be rejected");
        assert!(matches!(err, AppError::InvalidInput(_)));

        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn worktree_file_content_rejects_non_utf8_file() {
        let conn = setup_db();
        let project_id = create_project(&conn);
        let root = make_temp_dir();
        fs::write(root.join("artifact.bin"), [0xFF, 0xFE, 0x00, 0x01])
            .expect("artifact.bin should exist");

        let worktree = worktree_repo::create(
            &conn,
            WorktreeCreateInput {
                project_id,
                agent_id: None,
                branch_name: "feature/binary".into(),
                path: root.to_string_lossy().to_string(),
                base_branch: None,
                status: None,
            },
        )
        .expect("worktree create should succeed");

        let err = load_file_content_for_worktree(&conn, &worktree.id, "artifact.bin")
            .expect_err("binary file should be rejected");
        assert!(matches!(err, AppError::InvalidInput(_)));

        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn worktree_file_save_writes_utf8_text_file() {
        let conn = setup_db();
        let project_id = create_project(&conn);
        let root = make_temp_dir();
        fs::create_dir_all(root.join("src")).expect("src should exist");
        fs::write(root.join("src/lib.rs"), "pub fn meaning() -> i32 { 42 }\n")
            .expect("src/lib.rs should exist");

        let worktree = worktree_repo::create(
            &conn,
            WorktreeCreateInput {
                project_id,
                agent_id: Some("agent-1".into()),
                branch_name: "feature/save".into(),
                path: root.to_string_lossy().to_string(),
                base_branch: None,
                status: None,
            },
        )
        .expect("worktree create should succeed");

        let saved = save_file_content_for_worktree(
            &conn,
            &worktree.id,
            "src/lib.rs",
            "pub fn meaning() -> i32 { 43 }\n",
        )
        .expect("file content should save");

        assert_eq!(saved.worktree_id, worktree.id);
        assert_eq!(saved.relative_path, "src/lib.rs");
        assert_eq!(saved.content, "pub fn meaning() -> i32 { 43 }\n");
        assert_eq!(
            fs::read_to_string(root.join("src/lib.rs")).expect("saved file should be readable"),
            "pub fn meaning() -> i32 { 43 }\n"
        );

        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn worktree_file_save_rejects_missing_target() {
        let conn = setup_db();
        let project_id = create_project(&conn);
        let root = make_temp_dir();

        let worktree = worktree_repo::create(
            &conn,
            WorktreeCreateInput {
                project_id,
                agent_id: None,
                branch_name: "feature/save-missing".into(),
                path: root.to_string_lossy().to_string(),
                base_branch: None,
                status: None,
            },
        )
        .expect("worktree create should succeed");

        let err = save_file_content_for_worktree(&conn, &worktree.id, "src/missing.ts", "noop\n")
            .expect_err("missing file should be rejected");
        assert!(matches!(err, AppError::NotFound(_)));

        let _ = fs::remove_dir_all(root);
    }
}
