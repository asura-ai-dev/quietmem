# QuietMem Phase 2 フェーズ計画 (QTM-003 Agent Management UI)

Phase 2 を 4 つのサブフェーズ (2A / 2B / 2C / 2D) に分解する。バックエンドを先に固め、フロントエンドの基盤 (型 / service / store / トークン) を整え、UI コンポーネントは最後に強化する。

入力 spec: `agent-docs/spec.md`
詳細設計: `agent-docs/phase-2-architecture.md`, `phase-2-status-enum.md`, `agent-duplicate-design.md`, `phase-2-ui-design.md`

## 全体依存

```
Phase 2A (Backend: status enum + agent_duplicate)
   └─> Phase 2B (Frontend Foundation: bindings + service + store + tokens)
         └─> Phase 2C (UI Enhancement: status select + status badge + LeftSidebar 統合)
               └─> Phase 2D (Duplicate UI + 結合 Smoke)
```

各サブフェーズの最後に `cargo test --lib` (2A) / `pnpm tsc --noEmit && pnpm build` (2B/2C/2D) を通すチケットを含む。

---

## Phase 2A: バックエンド (status enum + duplicate)

Rust 側の status バリデーション基盤と `agent_duplicate` を実装する。フロントには触れない。Rust 単体テストで担保する。

| Task ID   | 名前                                                                | 依存                 |
| --------- | ------------------------------------------------------------------- | -------------------- |
| task-2A01 | `AgentStatus` ホワイトリスト + バリデータ追加                       | なし                 |
| task-2A02 | `agent_create` / `agent_update` への status 検証組み込み            | task-2A01            |
| task-2A03 | `AgentDuplicateInput` DTO 追加 (Rust)                               | task-2A01            |
| task-2A04 | `repo::agent::duplicate` 実装 + 単体テスト                          | task-2A03            |
| task-2A05 | `agent_duplicate` Tauri command + invoke_handler 登録               | task-2A04            |
| task-2A06 | Phase 2A 検証 (`cargo test --lib` / `cargo build` / `cargo clippy`) | task-2A02, task-2A05 |

依存元: Phase 1 完了 (Phase 1F の Phase 7 final status pass)

---

## Phase 2B: フロントエンド基盤 (bindings + service + store + tokens)

Phase 2A で追加したバックエンド API に対応する型 / service / store と、`tokens.css` に danger 色を追加する。UI コンポーネントにはまだ触れない。

| Task ID   | 名前                                                                         | 依存            |
| --------- | ---------------------------------------------------------------------------- | --------------- |
| task-2B01 | `bindings.ts` に `AgentStatus` / `AgentDuplicateInput` 追加 + 定数モジュール | task-2A06       |
| task-2B02 | `agentService.duplicate(...)` 追加                                           | task-2B01       |
| task-2B03 | `agentStore.duplicateAgent(...)` 追加                                        | task-2B02       |
| task-2B04 | `tokens.css` に `--color-danger` 系 + status alias 追加                      | なし            |
| task-2B05 | `uiStore` に `selectedAgentId` 昇格 (action 含む)                            | task-2B01       |
| task-2B06 | Phase 2B 検証 (`pnpm tsc --noEmit` / `pnpm build`)                           | task-2B01..2B05 |

---

## Phase 2C: UI 強化 (status select + status badge + LeftSidebar 統合)

既存 UI コンポーネントの status を `<select>` に置き換え、共通 `AgentStatusBadge` を導入し、LeftSidebar Agents セクションを実 Agent 一覧に置き換える。複製 UI には触れない。

| Task ID   | 名前                                                                              | 依存                 |
| --------- | --------------------------------------------------------------------------------- | -------------------- |
| task-2C01 | `AgentStatusBadge` コンポーネント新規作成                                         | task-2B04            |
| task-2C02 | `AgentList` の status 表示を `AgentStatusBadge` に置換                            | task-2C01            |
| task-2C03 | `AgentCreateForm` の status を `<select>` 化 (定数連携)                           | task-2B01            |
| task-2C04 | `AgentEditForm` の status を `<select>` 化                                        | task-2B01            |
| task-2C05 | `LeftSidebar` Agents セクションを実 Agent 一覧に置換 (uiStore 経由)               | task-2B05, task-2C01 |
| task-2C06 | `OverviewTab` の `selectedAgentId` を uiStore に切り替え                          | task-2B05            |
| task-2C07 | Phase 2C 検証 (`pnpm tsc --noEmit` / `pnpm build`) + 視覚 smoke (4 status バッジ) | task-2C02..2C06      |

---

## Phase 2D: 複製 UI + 結合 Smoke

複製ボタン / 確認ダイアログ / 統合 Smoke。Phase 2 の最後で全フローを通す。

| Task ID   | 名前                                                              | 依存                 |
| --------- | ----------------------------------------------------------------- | -------------------- |
| task-2D01 | `AgentDuplicateConfirm` コンポーネント新規作成                    | task-2C01, task-2B03 |
| task-2D02 | `AgentEditForm` に複製ボタン + Confirm 統合                       | task-2D01, task-2C04 |
| task-2D03 | Phase 2D 結合 Smoke チケット (手動 Smoke Flow + 再起動後保持確認) | task-2D02, task-2C07 |

---

## サマリ

- 合計サブフェーズ: 4 (2A / 2B / 2C / 2D)
- 合計チケット: 22 (2A: 6, 2B: 6, 2C: 7, 2D: 3)
- バックエンド先行で 6 チケット → フロント基盤 6 チケット → UI 強化 7 チケット → 複製 UI + Smoke 3 チケット
- 各サブフェーズの最後にビルド/テスト確認チケットを配置 (2A06 / 2B06 / 2C07 / 2D03)
- 評価チケット (Phase 7) は本 phases ファイルには含めず、orchestrator が Phase 2.5 で TaskCreate する

## 完了条件

各サブフェーズに属する全チケットの `done_when` が満たされたら次サブフェーズに進む。最終 Smoke は task-2D03 で実施し、QuietMem アプリ起動 → Project 選択 → Agent 作成 → 複製 → status 編集 → active worktree 紐付け → 再起動後保持を手動で全通しする。
