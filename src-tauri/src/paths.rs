use std::path::PathBuf;

use directories::ProjectDirs;

use crate::error::{AppError, AppResult};

/// QuietMem が使うローカルファイル保存先のパスを保持する構造体。
///
/// 参照: `agent-docs/file-storage.md`
///
/// ```text
/// <AppData>/QuietMem/
/// ├─ db/
/// │  └─ quietmem.sqlite
/// └─ projects/
///    └─ <project_id>/
///       ├─ agents/
///       │  └─ <agent_id>/
///       │     ├─ prompt/
///       │     ├─ config/
///       │     └─ raw/
///       ├─ runs/
///       │  └─ <run_id>/
///       │     └─ log/
///       └─ snapshots/
/// ```
#[derive(Debug, Clone)]
pub struct AppPaths {
    /// AppData ルート (OS 依存)。macOS では `~/Library/Application Support/QuietMem/` に相当。
    pub root: PathBuf,
}

impl AppPaths {
    /// プラットフォーム標準のアプリデータディレクトリから `AppPaths` を解決する。
    pub fn resolve() -> AppResult<Self> {
        let dirs = ProjectDirs::from("dev", "quietmem", "QuietMem")
            .ok_or_else(|| AppError::Internal("cannot resolve application data dir".to_string()))?;
        Ok(Self {
            root: dirs.data_dir().to_path_buf(),
        })
    }

    /// テスト用: 任意のルートで `AppPaths` を作る。
    #[allow(dead_code)]
    pub fn with_root(root: PathBuf) -> Self {
        Self { root }
    }

    /// 起動時に必ず存在させるベースディレクトリを作成する。
    ///
    /// 作成対象は `db/` と `projects/` のみ。他のサブディレクトリは
    /// 呼び出し側 (project / agent / run 作成時など) が必要に応じて作成する。
    pub fn ensure_base(&self) -> AppResult<()> {
        std::fs::create_dir_all(self.db_dir())?;
        std::fs::create_dir_all(self.projects_root())?;
        Ok(())
    }

    /// SQLite ファイルを置くディレクトリ。
    pub fn db_dir(&self) -> PathBuf {
        self.root.join("db")
    }

    /// SQLite 本体ファイルのパス。
    pub fn db_file(&self) -> PathBuf {
        self.db_dir().join("quietmem.sqlite")
    }

    /// すべての Project ディレクトリが置かれるルート。
    pub fn projects_root(&self) -> PathBuf {
        self.root.join("projects")
    }

    /// 指定 project の専用ディレクトリ。
    #[allow(dead_code)] // Phase 1B 後半の project / agent / run 作成 command から参照予定
    pub fn project_dir(&self, project_id: &str) -> PathBuf {
        self.projects_root().join(project_id)
    }

    /// 指定 project 配下の特定 agent 用ディレクトリ。
    #[allow(dead_code)] // Phase 1B 後半の agent command から参照予定
    pub fn agent_dir(&self, project_id: &str, agent_id: &str) -> PathBuf {
        self.project_dir(project_id).join("agents").join(agent_id)
    }

    /// agent の prompt ファイル置き場 (`prompt.md` 等)。
    #[allow(dead_code)] // Phase 1B 後半の agent command から参照予定
    pub fn agent_prompt_dir(&self, project_id: &str, agent_id: &str) -> PathBuf {
        self.agent_dir(project_id, agent_id).join("prompt")
    }

    /// agent の config ファイル置き場 (`config.json` 等)。
    #[allow(dead_code)] // Phase 1B 後半の agent command から参照予定
    pub fn agent_config_dir(&self, project_id: &str, agent_id: &str) -> PathBuf {
        self.agent_dir(project_id, agent_id).join("config")
    }

    /// agent の raw memory 本文置き場 (`<raw_memory_entry_id>.md` 等)。
    #[allow(dead_code)] // Phase 2 の raw memory command から参照予定
    pub fn agent_raw_dir(&self, project_id: &str, agent_id: &str) -> PathBuf {
        self.agent_dir(project_id, agent_id).join("raw")
    }

    /// 特定 run の実行ログ (`stdout.log` / `stderr.log` / `interaction.jsonl`) 置き場。
    #[allow(dead_code)] // Phase 2 の run command から参照予定
    pub fn run_log_dir(&self, project_id: &str, run_id: &str) -> PathBuf {
        self.project_dir(project_id)
            .join("runs")
            .join(run_id)
            .join("log")
    }

    /// プロジェクトのスナップショット置き場。
    #[allow(dead_code)] // Phase 2 の snapshot command から参照予定
    pub fn snapshots_dir(&self, project_id: &str) -> PathBuf {
        self.project_dir(project_id).join("snapshots")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn with_root_builds_expected_subpaths() {
        let root = PathBuf::from("/tmp/quietmem-test");
        let paths = AppPaths::with_root(root.clone());

        assert_eq!(paths.root, root);
        assert_eq!(paths.db_dir(), root.join("db"));
        assert_eq!(paths.db_file(), root.join("db").join("quietmem.sqlite"));
        assert_eq!(paths.projects_root(), root.join("projects"));

        assert_eq!(paths.project_dir("p1"), root.join("projects").join("p1"));
        assert_eq!(
            paths.agent_dir("p1", "a1"),
            root.join("projects").join("p1").join("agents").join("a1")
        );
        assert_eq!(
            paths.agent_prompt_dir("p1", "a1"),
            root.join("projects")
                .join("p1")
                .join("agents")
                .join("a1")
                .join("prompt")
        );
        assert_eq!(
            paths.agent_config_dir("p1", "a1"),
            root.join("projects")
                .join("p1")
                .join("agents")
                .join("a1")
                .join("config")
        );
        assert_eq!(
            paths.agent_raw_dir("p1", "a1"),
            root.join("projects")
                .join("p1")
                .join("agents")
                .join("a1")
                .join("raw")
        );
        assert_eq!(
            paths.run_log_dir("p1", "r1"),
            root.join("projects")
                .join("p1")
                .join("runs")
                .join("r1")
                .join("log")
        );
        assert_eq!(
            paths.snapshots_dir("p1"),
            root.join("projects").join("p1").join("snapshots")
        );
    }

    #[test]
    fn ensure_base_creates_db_and_projects_dirs() {
        let tmp =
            std::env::temp_dir().join(format!("quietmem-ensure-base-{}", uuid::Uuid::now_v7()));
        let paths = AppPaths::with_root(tmp.clone());

        paths.ensure_base().expect("ensure_base should succeed");

        assert!(paths.db_dir().is_dir());
        assert!(paths.projects_root().is_dir());

        // cleanup
        let _ = std::fs::remove_dir_all(&tmp);
    }

    #[test]
    fn ensure_base_is_idempotent() {
        let tmp = std::env::temp_dir().join(format!(
            "quietmem-ensure-base-idempotent-{}",
            uuid::Uuid::now_v7()
        ));
        let paths = AppPaths::with_root(tmp.clone());

        paths.ensure_base().expect("first call");
        paths.ensure_base().expect("second call should not error");

        let _ = std::fs::remove_dir_all(&tmp);
    }
}
