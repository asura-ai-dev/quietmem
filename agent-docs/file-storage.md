# ローカルファイル保存先規約

## 概要

QuietMem が SQLite 以外のデータを保存するためのディレクトリ規約。L09 に従い、重い本文や生成物はローカルファイルに置く。Phase 1 ではルート計算とディレクトリ作成ロジックのみを実装する (中身は空でよい)。

## 仕様からの対応

- spec.md §2.1 (ローカルファイル保存先のディレクトリ規約)
- spec.md §4.2 ローカルファイル保存先の基礎ルール
- spec.md §5.1 受け入れ条件 (ディレクトリ規約定義)
- L09-data-storage.md §3 Local File Storage Targets

## アプリデータルート

macOS: `~/Library/Application Support/QuietMem/`

他プラットフォームは Tauri の `tauri::api::path::app_data_dir` または `dirs::data_dir()` の結果に `QuietMem` を append した結果を使う。Phase 1 は macOS を主ターゲットとするが、コードはプラットフォーム非依存に書く。

Rust では `directories` crate (または `dirs` crate) を使って解決する。AppState 初期化時に 1 度だけ計算し、`PathBuf` として保持する。

```rust
// src-tauri/src/paths.rs
use std::path::{Path, PathBuf};
use crate::error::{AppError, AppResult};

pub struct AppPaths {
    pub root: PathBuf,
}

impl AppPaths {
    pub fn resolve() -> AppResult<Self> {
        let base = directories::ProjectDirs::from("dev", "quietmem", "QuietMem")
            .ok_or_else(|| AppError::Internal("cannot resolve data dir".into()))?;
        Ok(Self { root: base.data_dir().to_path_buf() })
    }

    pub fn db_dir(&self) -> PathBuf { self.root.join("db") }
    pub fn db_file(&self) -> PathBuf { self.db_dir().join("quietmem.sqlite") }

    pub fn projects_root(&self) -> PathBuf { self.root.join("projects") }

    pub fn project_dir(&self, project_id: &str) -> PathBuf {
        self.projects_root().join(project_id)
    }

    pub fn agent_dir(&self, project_id: &str, agent_id: &str) -> PathBuf {
        self.project_dir(project_id).join("agents").join(agent_id)
    }

    pub fn agent_prompt_dir(&self, p: &str, a: &str) -> PathBuf {
        self.agent_dir(p, a).join("prompt")
    }
    pub fn agent_config_dir(&self, p: &str, a: &str) -> PathBuf {
        self.agent_dir(p, a).join("config")
    }
    pub fn agent_raw_dir(&self, p: &str, a: &str) -> PathBuf {
        self.agent_dir(p, a).join("raw")
    }

    pub fn run_log_dir(&self, project_id: &str, run_id: &str) -> PathBuf {
        self.project_dir(project_id).join("runs").join(run_id).join("log")
    }

    pub fn snapshots_dir(&self, project_id: &str) -> PathBuf {
        self.project_dir(project_id).join("snapshots")
    }

    /// 起動時に必ず存在させるディレクトリ
    pub fn ensure_base(&self) -> AppResult<()> {
        std::fs::create_dir_all(self.db_dir())?;
        std::fs::create_dir_all(self.projects_root())?;
        Ok(())
    }
}
```

## ディレクトリ構造

```
<AppData>/QuietMem/
├─ db/
│  └─ quietmem.sqlite              # SQLite 本体
└─ projects/
   └─ <project_id>/
      ├─ agents/
      │  └─ <agent_id>/
      │     ├─ prompt/             # prompt ファイル
      │     ├─ config/             # agent 設定 JSON
      │     └─ raw/                # raw memory 本文
      ├─ runs/
      │  └─ <run_id>/
      │     └─ log/                # 実行ログ全文
      └─ snapshots/                # スナップショット
```

## 命名規則

- `<project_id>` / `<agent_id>` / `<run_id>` はすべて UUID v7 の文字列表現
- prompt ファイル: `prompt.md` (Phase 1 では定義のみ、生成しない)
- config ファイル: `config.json`
- raw memory 本文: `<raw_memory_entry_id>.md`
- 実行ログ: `stdout.log`, `stderr.log`, `interaction.jsonl`
- スナップショット: `<timestamp>-<label>.tar.gz`

これらはコメントまたは定数としてコードに残すが、Phase 1 で生成するのはディレクトリのみ。

## Phase 1 で実施すること

- 起動時に `AppPaths::resolve()` を呼んで `AppState` に保持
- `ensure_base()` で `db/` と `projects/` を作成
- project 作成時 `project_dir()` 以下を作成するかは Phase 1 では必須ではない (後続で実装可)。推奨: create 時に `project_dir()` + `agents/` + `runs/` + `snapshots/` を作っておく
- agent 作成時 `agent_prompt_dir` / `agent_config_dir` / `agent_raw_dir` を作っておく (空ディレクトリで可)

## Phase 1 で実施しないこと

- prompt / config / raw memory / log / snapshot の実ファイル書き込み
- クリーンアップ / ローテーション
- パーミッション制御

## 制約・注意事項

- パスセパレータは `PathBuf` を使って OS 差異を吸収する (文字列結合で `/` をハードコードしない)
- `project_id` / `agent_id` は UUID なのでエスケープ不要だが、将来的に slug を使う場合に備えて `sanitize` 関数をユーティリティとして用意しておく余地を残す (Phase 1 では実装不要)
- テスト時は `AppPaths` をコンストラクタ経由で差し替え可能にし、テンポラリディレクトリを渡せるようにする
- 既に存在するディレクトリへの `create_dir_all` はエラーにしない (`std::fs::create_dir_all` の仕様通り)
