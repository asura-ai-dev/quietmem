# Tauri Commands

## 概要

Phase 1 でフロントエンドから呼び出せる Tauri command の API 定義。Rust 側の構造体と TypeScript 側の型ミラーを 1 対 1 で対応させる。

## 仕様からの対応

- spec.md §2.2 バックエンド層
- spec.md §4.3 Tauri commands (CRUD)
- spec.md §5.1 受け入れ条件
- spec.md §11.2 Evaluator Checklist (API)

## 命名規則

- Rust 関数名 / Tauri コマンド名: snake*case の `<entity>*<action>` 形式
  - 例: `project_create`, `agent_list_by_project`, `worktree_update`
- TypeScript サービス関数名: camelCase
  - 例: `createProject`, `listAgentsByProject`, `updateWorktree`
- Rust の入力 DTO は `XxxInput`、出力 DTO は `Xxx` (単数) または `Xxx` の配列

## エラー型

### Rust

```rust
// src-tauri/src/error.rs
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("not found: {0}")]
    NotFound(String),
    #[error("invalid input: {0}")]
    InvalidInput(String),
    #[error("db error: {0}")]
    Db(#[from] rusqlite::Error),
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
    #[error("internal: {0}")]
    Internal(String),
}

impl serde::Serialize for AppError {
    fn serialize<S: serde::Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        #[derive(serde::Serialize)]
        struct Payload<'a> { code: &'a str, message: String }
        let code = match self {
            AppError::NotFound(_) => "not_found",
            AppError::InvalidInput(_) => "invalid_input",
            AppError::Db(_) => "db_error",
            AppError::Io(_) => "io_error",
            AppError::Internal(_) => "internal",
        };
        Payload { code, message: self.to_string() }.serialize(s)
    }
}

pub type AppResult<T> = Result<T, AppError>;
```

### TypeScript

```ts
// src/types/bindings.ts
export interface AppErrorPayload {
  code: "not_found" | "invalid_input" | "db_error" | "io_error" | "internal";
  message: string;
}
```

services 層は invoke の reject を捕捉して `AppErrorPayload` としてそのまま上位に throw する。

## DTO 型定義

```rust
// Rust 側 (commands/project.rs 他に配置)
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub root_path: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectCreateInput {
    pub name: String,
    pub slug: String,
    pub root_path: String,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectUpdateInput {
    pub id: String,
    pub name: Option<String>,
    pub slug: Option<String>,
    pub root_path: Option<String>,
}
```

Agent / Worktree も同様のパターンで DTO を定義する。`camelCase` 変換を入れることで TS 側が違和感なく扱える。

```ts
// src/types/bindings.ts (抜粋)
export interface Project {
  id: string;
  name: string;
  slug: string;
  rootPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreateInput {
  name: string;
  slug: string;
  rootPath: string;
}

export interface ProjectUpdateInput {
  id: string;
  name?: string;
  slug?: string;
  rootPath?: string;
}

export interface Agent {
  id: string;
  projectId: string;
  name: string;
  role: string;
  adapterType: string;
  promptPath: string | null;
  configPath: string | null;
  status: string;
  activeWorktreeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCreateInput {
  projectId: string;
  name: string;
  role: string;
  adapterType: string;
  promptPath?: string | null;
  configPath?: string | null;
  status?: string;
}

export interface AgentUpdateInput {
  id: string;
  name?: string;
  role?: string;
  adapterType?: string;
  promptPath?: string | null;
  configPath?: string | null;
  status?: string;
  activeWorktreeId?: string | null;
}

export interface Worktree {
  id: string;
  projectId: string;
  agentId: string | null;
  branchName: string;
  path: string;
  baseBranch: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorktreeCreateInput {
  projectId: string;
  agentId?: string | null;
  branchName: string;
  path: string;
  baseBranch: string;
  status?: string;
}

export interface WorktreeUpdateInput {
  id: string;
  agentId?: string | null;
  branchName?: string;
  path?: string;
  baseBranch?: string;
  status?: string;
}
```

## コマンド一覧

| コマンド名 (Rust)          | 引数                    | 戻り値          | Rust モジュール      | 備考                          |
| -------------------------- | ----------------------- | --------------- | -------------------- | ----------------------------- |
| `project_create`           | `ProjectCreateInput`    | `Project`       | `commands::project`  | slug 重複で `InvalidInput`    |
| `project_list`             | なし                    | `Vec<Project>`  | `commands::project`  | updatedAt DESC                |
| `project_update`           | `ProjectUpdateInput`    | `Project`       | `commands::project`  | 未指定フィールドは変更しない  |
| `agent_create`             | `AgentCreateInput`      | `Agent`         | `commands::agent`    | project_id 存在チェック       |
| `agent_list_by_project`    | `{ projectId: String }` | `Vec<Agent>`    | `commands::agent`    | 存在しない projectId は空配列 |
| `agent_update`             | `AgentUpdateInput`      | `Agent`         | `commands::agent`    | `activeWorktreeId` 更新を含む |
| `worktree_create`          | `WorktreeCreateInput`   | `Worktree`      | `commands::worktree` | project_id 存在チェック       |
| `worktree_list_by_project` | `{ projectId: String }` | `Vec<Worktree>` | `commands::worktree` |                               |
| `worktree_update`          | `WorktreeUpdateInput`   | `Worktree`      | `commands::worktree` |                               |

## invoke ラッパー (TypeScript)

```ts
// src/services/projectService.ts
import { invoke } from "@tauri-apps/api/core";
import type {
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
} from "../types/bindings";

export const projectService = {
  create: (input: ProjectCreateInput) =>
    invoke<Project>("project_create", { input }),
  list: () => invoke<Project[]>("project_list"),
  update: (input: ProjectUpdateInput) =>
    invoke<Project>("project_update", { input }),
};
```

- invoke の第 2 引数は `{ input }` で統一 (Rust 側の関数引数名に合わせる)
- `agent_list_by_project` / `worktree_list_by_project` のように引数 1 つの場合は `{ projectId }` のようにフラットに渡す

## Rust コマンド実装パターン

```rust
// src-tauri/src/commands/project.rs
#[tauri::command]
pub fn project_create(
    state: tauri::State<'_, AppState>,
    input: ProjectCreateInput,
) -> AppResult<Project> {
    let conn = state.conn.lock().map_err(|_| AppError::Internal("lock".into()))?;
    db::repo::project::create(&conn, input)
}
```

- `State<AppState>` で共有接続を取得
- ロック失敗は `AppError::Internal`
- 実際のビジネスロジックは repo 層に置き、command はバリデーションと DTO 変換に徹する

## バリデーション方針

- 空文字 (`name`, `slug`, `root_path`, `branch_name`, `path`) は `InvalidInput`
- `slug` は ASCII 英数 + `-` / `_` のみを許可 (正規表現 `^[a-zA-Z0-9_-]+$`)
- `projectId` が存在しない場合は create 系で `NotFound`
- update で対象 id が存在しない場合は `NotFound`

## 制約・注意事項

- Phase 1 では runs / raw_memory_entries / curated_memories の command を作らない
- エラーコードのバリエーションは上記 5 種類で固定。追加したい場合は architect に相談
- 日付はすべて Rust 側で生成し、フロントエンドから受け取らない
- ID 生成も Rust 側で行う (フロントエンドから ID を渡さない)
