# QuietMem Phase 1 フェーズ計画

Phase 1 (QTM-001 + QTM-002) を 6 つのサブフェーズに分解する。各サブフェーズは前段の成果物に依存するが、同一サブフェーズ内のチケットは原則として前の番号のチケットにのみ依存する。

## 全体依存

```
Phase 1A (プロジェクト基盤)
   └─> Phase 1B (SQLite データ層)
         └─> Phase 1C (Tauri commands)
               └─> Phase 1D (フロントエンド基盤)
                     └─> Phase 1E (Workspace Shell)
                           └─> Phase 1F (Project / Agent / Worktree UI + 統合)
```

Phase 1D は Phase 1C と直列依存ではなく、厳密には Phase 1A 完了時点で着手可能。ただし services 層の型 (bindings.ts) は Phase 1C で確定する DTO と一致させる必要があるため、Phase 1D 内で `bindings.ts` を書くチケットは Phase 1C 完了後に着手する。

## Phase 1A: プロジェクト基盤

Tauri + React + Vite + TypeScript の初期化と Hello World 起動確認。

- `task-1A01` : Tauri プロジェクトスケルトン生成 (Cargo / src-tauri / tauri.conf.json)
- `task-1A02` : Vite + React + TS + pnpm フロントエンド雛形生成
- `task-1A03` : 起動確認用の最小 `main.tsx` / `App.tsx` と tauri.conf の window 設定
- `task-1A04` : `AppState` 骨格 + `AppPaths` (`src-tauri/src/paths.rs`) + 起動時 `ensure_base()`

依存: なし (task-1A01 は最初のチケット)

## Phase 1B: SQLite データ層

rusqlite + 自前マイグレーション runner + 6 テーブル + repo 層 + 単体テスト。

- `task-1B01` : rusqlite と依存 crate 追加、`db/connection.rs` (WAL / FK ON)
- `task-1B02` : マイグレーション runner (`db/migration.rs`) + `schema_migrations` 表
- `task-1B03` : `001_init.sql` に 6 テーブル定義を書く
- `task-1B04` : `db/repo/project.rs` (create / list / update) + テスト
- `task-1B05` : `db/repo/agent.rs` (create / list_by_project / update) + テスト
- `task-1B06` : `db/repo/worktree.rs` (create / list_by_project / update) + テスト
- `task-1B07` : 起動時の DB 初期化 (`AppState` に接続を保持) + テーブル存在 smoke テスト

依存: Phase 1A 完了

## Phase 1C: Tauri commands

projects / agents / worktrees の CRUD を Tauri commands として公開。

- `task-1C01` : `commands/mod.rs` + `AppError` + `AppResult` (`error.rs`)
- `task-1C02` : `commands/project.rs` (project_create / project_list / project_update)
- `task-1C03` : `commands/agent.rs` (agent_create / agent_list_by_project / agent_update)
- `task-1C04` : `commands/worktree.rs` (worktree_create / worktree_list_by_project / worktree_update)
- `task-1C05` : `tauri::Builder::invoke_handler` への登録 + `app_state.rs` の共有

依存: Phase 1B 完了

## Phase 1D: フロントエンド基盤

TypeScript 型ミラー、services 層、zustand store、デザイントークン。

- `task-1D01` : `src/types/bindings.ts` (Rust DTO と 1:1 の TS 型)
- `task-1D02` : `src/services/projectService.ts` / `agentService.ts` / `worktreeService.ts`
- `task-1D03` : `src/store/uiStore.ts` (route / activeTab / drawerOpen / drawerTab)
- `task-1D04` : `src/store/projectStore.ts` / `agentStore.ts` (ドメインキャッシュ)
- `task-1D05` : `src/styles/tokens.css` + `global.css` + `main.tsx` へ読み込み

依存: Phase 1C 完了 (bindings.ts 生成のため)

## Phase 1E: Workspace Shell

5 領域レイアウト、MainTabs 切替、別画面 (Dashboard / Settings / FirstRun) 経路。

- `task-1E01` : `WorkspaceRoute` + grid レイアウト + `ShellBody`
- `task-1E02` : `Header` / `LeftSidebar` (最小) / `RightPanel` (3 セクション)
- `task-1E03` : `MainTabs` (5 タブ切替 + プレースホルダ中身)
- `task-1E04` : `BottomDrawer` (開閉 + 4 タブ)
- `task-1E05` : `FirstRunRoute` / `DashboardRoute` / `SettingsRoute` + `App.tsx` ルーティング分岐

依存: Phase 1D 完了

## Phase 1F: Project / Agent / Worktree UI + 統合

Overview タブ内の実 UI と Tauri commands 接続、Smoke Flow の通し。

- `task-1F01` : `ProjectList` + `ProjectCreateForm` + `projectService` 接続
- `task-1F02` : `AgentList` + `AgentCreateForm` + `agentService` 接続
- `task-1F03` : `WorktreeList` + `WorktreeCreateForm` + `worktreeService` 接続
- `task-1F04` : `AgentEditForm` で `activeWorktreeId` を Worktree 一覧から選択可能にする
- `task-1F05` : 統合 Smoke: 初回セットアップ → Project 作成 → Overview で Agent/Worktree 作成 → active_worktree_id 反映 → 再起動確認

依存: Phase 1E 完了

## フェーズ完了判定

各サブフェーズに属する全チケットの `done_when` が満たされたら次のサブフェーズへ進む。Smoke Flow の最終確認は `task-1F05` で実施する。
