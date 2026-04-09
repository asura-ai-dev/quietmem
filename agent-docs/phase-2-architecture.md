# Phase 2 アーキテクチャ概要 (QTM-003 Agent Management UI)

## 概要

Phase 2 (QTM-003) の目的は、Phase 1 で構築した Agent CRUD 基盤の上に「Agent 管理 UI」を成立させることである。本ドキュメントは Phase 2 で導入する変更点・影響範囲・既存資産への差分を一覧化する。詳細は領域別ドキュメントに分割する。

- 入力 spec: `agent-docs/spec.md` (Phase 2 / QTM-003 spec)
- 前提: Phase 1 完了 (agent-docs/architecture.md / db-schema.md / tauri-commands.md / ui-shell.md)
- 領域別 docs:
  - `agent-docs/phase-2-status-enum.md` — status 4 値のバックエンド/フロント型整合
  - `agent-docs/agent-duplicate-design.md` — `agent_duplicate` command の入出力と内部処理
  - `agent-docs/phase-2-ui-design.md` — LeftSidebar 統合 / Agent 一覧 status バッジ / 複製確認 UI

## 仕様からの対応

| spec 章                        | 本ドキュメント側         |
| ------------------------------ | ------------------------ |
| §1 目的                        | 本書 §概要               |
| §2.1 フロントエンド層          | UI 設計 docs             |
| §2.2 バックエンド層            | status / 複製 docs       |
| §2.3 データ層                  | status doc §DB 互換性    |
| §2.4 型定義                    | status doc + 複製 doc    |
| §4 主要機能                    | 各 UI / API doc          |
| §5 データ層変更                | status doc               |
| §6 Tauri commands 追加         | 複製 doc                 |
| §7 受け入れ条件                | done_when ファイルに分散 |
| §11 想定ユーザーフロー (Smoke) | task-2D01 (Smoke)        |

## レイヤ別の変更マップ

```
+--------------------------------------------------+
| UI Layer                                         |
|  - LeftSidebar Agents セクション (placeholder 撤去)|
|  - AgentList: status バッジ強化                  |
|  - AgentCreateForm: status を <select> に        |
|  - AgentEditForm: status を <select> + 複製ボタン |
|  - DuplicateConfirm: 確認 UI (新規)              |
|  - tokens.css: --color-danger / status alias 追加|
+--------------------------------------------------+
| Frontend Service / Store                         |
|  - bindings.ts: AgentStatus 型 / AgentDuplicateInput|
|  - agentService.duplicate() を追加               |
|  - agentStore.duplicateAgent() を追加            |
|  - uiStore: selectedAgentId を昇格 (任意)        |
+--------------------------------------------------+
| Tauri Commands                                   |
|  - agent_duplicate (新規)                        |
|  - agent_create / agent_update: status 検証追加   |
|  - lib.rs invoke_handler に登録                  |
+--------------------------------------------------+
| Domain / Repo                                    |
|  - domain::agent::AgentStatus 定数を新設         |
|  - AgentDuplicateInput DTO を追加                |
|  - repo::agent::duplicate() を追加               |
|  - status バリデーション関数を共通化              |
+--------------------------------------------------+
| DB                                               |
|  - スキーマ変更なし (Phase 1 の `agents` を継承)  |
|  - マイグレーション追加なし                       |
+--------------------------------------------------+
```

## 影響範囲 (Phase 1 ファイルへの差分)

### 変更が入るファイル

| ファイル                                   | 種別        | 概要                                                          |
| ------------------------------------------ | ----------- | ------------------------------------------------------------- |
| `src-tauri/src/domain/agent.rs`            | 追加 + 修正 | `AgentStatus` 定数 / `AgentDuplicateInput` DTO 追加           |
| `src-tauri/src/db/repo/agent.rs`           | 追加 + 修正 | status バリデーション関数 / `duplicate` 関数追加              |
| `src-tauri/src/commands/agent.rs`          | 追加        | `agent_duplicate` command 追加                                |
| `src-tauri/src/lib.rs`                     | 修正        | `invoke_handler` に `agent_duplicate` を登録                  |
| `src/types/bindings.ts`                    | 追加        | `AgentStatus` / `AgentDuplicateInput` / `Agent.status` 型強化 |
| `src/services/agentService.ts`             | 追加        | `duplicate` メソッド                                          |
| `src/store/agentStore.ts`                  | 追加        | `duplicateAgent` action                                       |
| `src/styles/tokens.css`                    | 追加        | `--color-danger` セマンティック alias / status カラー         |
| `src/features/agents/AgentCreateForm.tsx`  | 修正        | status を `<select>` 化                                       |
| `src/features/agents/AgentEditForm.tsx`    | 修正        | status を `<select>` 化 + 複製ボタン追加                      |
| `src/features/agents/AgentList.tsx`        | 修正        | status バッジ強化 (色 + ラベル)                               |
| `src/features/agents/AgentList.module.css` | 修正        | status バッジ用クラス追加                                     |
| `src/shell/LeftSidebar.tsx`                | 修正        | Agents セクション placeholder 撤去 → 実 Agent 一覧            |
| `src/shell/LeftSidebar.module.css`         | 修正        | Agent 行 + status バッジ用クラス                              |
| `src/store/uiStore.ts`                     | 任意で修正  | `selectedAgentId` を OverviewTab から昇格 (Phase 2C)          |
| `src/tabs/OverviewTab.tsx`                 | 修正        | `selectedAgentId` を uiStore 経由に置換 (任意)                |

### 新規ファイル

| ファイル                                               | 種別 | 概要                            |
| ------------------------------------------------------ | ---- | ------------------------------- |
| `src/features/agents/AgentStatusBadge.tsx`             | 新規 | status バッジ共通コンポーネント |
| `src/features/agents/AgentStatusBadge.module.css`      | 新規 | status バッジのスタイル         |
| `src/features/agents/AgentDuplicateConfirm.tsx`        | 新規 | 複製確認 inline ダイアログ      |
| `src/features/agents/AgentDuplicateConfirm.module.css` | 新規 | 確認 UI のスタイル              |

### Phase 1 で「触らない」と決めるファイル

- `src-tauri/src/db/migrations/*.sql` (新規追加なし)
- `src-tauri/src/db/repo/project.rs` / `worktree.rs` (Phase 2 では変更しない。技術的負債は QTM-009)
- `src/tabs/EditorTab.tsx` / `MemoryTab.tsx` / `RunsTab.tsx` / `CronTab.tsx` (placeholder のまま継続)
- `raw_memory_entries` / `curated_memories` テーブル (触らないことが「memory 非引継ぎ」の実装)

## サブフェーズ分割方針

実装は以下 4 サブフェーズに分ける。各サブフェーズは前段の output を前提とする。

```
Phase 2A (バックエンド: status enum + duplicate)
   └─> Phase 2B (フロント基盤: bindings + service + store + tokens)
         └─> Phase 2C (UI 強化: status select / バッジ / LeftSidebar 統合)
               └─> Phase 2D (UI 仕上げ: 複製 UI / 結合 Smoke)
```

- **Phase 2A**: バックエンド層 (Rust) で status enum 検証と `agent_duplicate` を実装する。フロントには触れない。Rust 単体テストで担保する。
- **Phase 2B**: 型とデータレイヤ (`bindings.ts` / `agentService` / `agentStore` / `tokens.css`) を更新する。UI コンポーネントにはまだ触れない。
- **Phase 2C**: 既存 UI コンポーネント (`AgentList` / `AgentCreateForm` / `AgentEditForm` / `LeftSidebar`) を status 強化と統合方向で改修する。複製 UI には触れない。
- **Phase 2D**: 複製確認 UI と結合 Smoke チケット。Phase 2 の最後に手動 Smoke で全体を通す。

## チケット粒度の指針

- 1 チケット = generator が 1 コンテキスト (約 30〜60 分) で完結できる単位
- バックエンドは「DTO 定義 → repo 関数 → command → handler 登録」を分離
- フロントは「型 → service → store → 個別 UI コンポーネント」を分離
- 各サブフェーズの最後に検証 (`cargo test` / `pnpm tsc --noEmit` / `pnpm build`) を実行する

## 制約・注意事項

- Phase 2 では DB マイグレーションを追加しない (`agents.status` のカラム型は文字列のまま)
- Rust 側ホワイトリストは "前方互換のためのエスケープハッチ" として、read 経路ではバリデーションしない (write 経路のみ)
- `AppError::InvalidInput` のメッセージは英語固定 (日本語化は QTM-009)
- 複製時に memory テーブルへ INSERT を **行わない** ことが「memory 非引継ぎ」の実装そのもの。Rust 単体テストで raw_memory_entries / curated_memories の COUNT が変わらないことを検証する
- LeftSidebar / Overview の `selectedAgentId` は同一の真実源を共有する。Phase 2C で `uiStore` への昇格を行う (Phase 1 では Overview ローカル state)
- すべての色値は `tokens.css` のセマンティック alias (`--color-danger` 等) を経由する。raw 色値の直書きは禁止
