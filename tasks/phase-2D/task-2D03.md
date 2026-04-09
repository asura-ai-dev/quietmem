# task-2D03: Phase 2D 結合 Smoke (手動 Smoke Flow + 再起動後保持確認)

## Phase

2D

## Depends on

- task-2D02
- task-2C07

## Goal

Phase 2 (QTM-003) 全体の結合 Smoke を実施し、spec.md §11 の想定ユーザーフロー全 13 ステップが GUI 上で完遂すること、および Tauri アプリ再起動後にデータが保持されていることを確認する。Phase 2 の最終確認チケット。

## Scope

- 検証のみ (コード変更なし)
- 軽微なバグ修正は本チケット内で対応してよい (3 行以下、それ以上は別チケット化)
- handoff ドキュメント `agent-output/phase-2-smoke-status.md` を新規作成して結果を記録する

## Implementation Notes

参照: `agent-docs/spec.md` §11 想定ユーザーフロー (Smoke Flow)

### 事前準備

1. `cargo build` (src-tauri) が success
2. `pnpm build` が success
3. SQLite DB ファイル (`AppData/QuietMem/db/quietmem.sqlite`) を一度バックアップする (オプション)

### 実行手順 (spec.md §11 全 13 ステップ)

1. `pnpm tauri dev` で QuietMem を起動 (Phase 1 で作成済の Project が 1 件以上存在する状態)
2. LeftSidebar から対象 Project (例: alpha) を選択する
3. LeftSidebar の Agents セクションに当該 Project の Agent 一覧が表示される **(空でも空状態メッセージが出ればよい)**
4. Overview タブで「New Agent」フォームから Agent A を作成する
   - name=`planner`
   - role=`planner`
   - adapter_type=`cli`
   - status=`idle` (select default)
5. 一覧 (Overview + LeftSidebar) に Agent A が追加され、status バッジが `idle` (muted) で表示される
6. Overview の Agent A の編集ボタンを押し、AgentEditForm を開く
7. 編集フォーム上部の「複製」ボタンを押す
8. AgentDuplicateConfirm が inline で表示され、以下が明示されている:
   - 引き継がれる: name (copy 接尾辞) / role / adapter type / prompt path / config path
   - 引き継がれない: memory (raw / curated) / active worktree / status (idle で開始)
9. ユーザーが「複製を実行」を選ぶと、Agent A2 (`planner (copy)`) が一覧に追加される
10. Agent A2 が編集フォームに自動的に切り替わる (`uiStore.selectedAgentId` 更新)
11. Agent A2 の status を `running` に変更し保存する
12. Agent A2 の active worktree を既存 Worktree に紐付ける (Worktree が無ければ Worktrees セクションで先に作成)
13. 一覧で Agent A (`idle` / muted) と Agent A2 (`running` / sage) が並んで表示される
14. **アプリを再起動** (`pnpm tauri dev` を Ctrl-C で停止 → 再起動)
15. 再起動後、Project alpha を選択 → Agent A / Agent A2 がともに表示され、A2 の status が `running`、active worktree が紐付いたままになっている

### sqlite3 検証 (CLI からの数値確認)

DB ファイルに直接アクセスして以下を確認:

```bash
sqlite3 ~/Library/Application\ Support/QuietMem/db/quietmem.sqlite \
  "SELECT id, name, status, active_worktree_id FROM agents WHERE name LIKE 'planner%';"
```

期待:

- 行が 2 件存在
- A2 の name が `planner (copy)`
- A2 の status が `running`
- A2 の active_worktree_id が non-null
- A2 の id が A の id と異なる

```bash
sqlite3 ~/Library/Application\ Support/QuietMem/db/quietmem.sqlite \
  "SELECT COUNT(*) FROM raw_memory_entries; SELECT COUNT(*) FROM curated_memories;"
```

期待:

- 両方とも 0 (Phase 2 では memory 操作なし)

注意: macOS の AppData パスは `~/Library/Application\ Support/QuietMem/` を想定。実環境のパスは `paths.rs` を確認する。

### Status バッジの視覚確認 (4 値)

別途 (もしくは smoke 中に) 以下も確認する:

- 4 値それぞれの Agent を作成 (idle / running / error / needs_input)
- LeftSidebar / AgentList / AgentEditForm の 3 箇所で status バッジの色 + テキストが視覚的に区別される
- needs_input のラベル表記が `needs input` (スペース入り) であること

### 受け入れ条件チェックリスト (spec.md §7)

| 番号 | 項目                                                                            | 結果 |
| ---- | ------------------------------------------------------------------------------- | ---- |
| §7.1 | LeftSidebar Agents セクションが選択中 Project 配下の一覧を表示                  |      |
| §7.1 | Overview の AgentList が name / role / status / active worktree を表示          |      |
| §7.1 | Project 切り替えで Agents セクションが追従                                      |      |
| §7.1 | 0 件のとき空状態メッセージ                                                      |      |
| §7.2 | name / role / adapter_type / status / prompt_path / config_path を入力できる    |      |
| §7.2 | name 空のとき create はフロント検証で止まる                                     |      |
| §7.2 | status を 4 値以外に設定する手段が UI 上に存在しない (select 制限)              |      |
| §7.3 | 編集ボタンから既存 Agent を編集できる                                           |      |
| §7.3 | name / role / adapterType / status / activeWorktree を変更し保存できる          |      |
| §7.3 | 別 Agent 選択時にフォームが当該 Agent の値で初期化される                        |      |
| §7.4 | 複製ボタンが存在する                                                            |      |
| §7.4 | 確認 UI に「memory 引き継がない / status は idle / active worktree 未割当」明示 |      |
| §7.4 | 実行で agent_duplicate 経由 → 一覧に新 Agent が現れる                           |      |
| §7.4 | 新 Agent の id / created_at / updated_at が元と異なる                           |      |
| §7.4 | 新 Agent の role / adapter_type / prompt_path / config_path が元と一致          |      |
| §7.4 | 新 Agent の status が `idle`、active_worktree_id が `null`                      |      |
| §7.4 | raw_memory_entries / curated_memories に新 Agent 用の行が生成されていない       |      |
| §7.5 | 4 値が一覧と編集フォームで視覚的に区別される                                    |      |
| §7.5 | 視覚区別が色のみに依存しない (テキストも読める)                                 |      |
| §7.5 | 4 値以外を Rust 経由で送ると InvalidInput (Rust 単体テストで担保済)             |      |
| §7.6 | 複数 Project 切替で Agents セクション追従                                       |      |
| §7.7 | 統合 Smoke (本チケット) 全 15 ステップ完遂                                      |      |
| §7.7 | 再起動後にデータ保持                                                            |      |

すべて pass したら本チケットを done とする。fail があれば fix 後に再実行する。

### handoff の作成

`agent-output/phase-2-smoke-status.md` を新規作成して以下を記録:

- 実施日時
- 各ステップの結果 (pass / fail)
- sqlite3 検証の出力
- 観察された issue / 軽微修正の内容
- 次フェーズ (QTM-005 / QTM-006) への引き継ぎ事項

### 不合格条件

- §7.4 の `idle` / `null` 強制が破られている
- duplicate 後に raw_memory_entries / curated_memories の COUNT が変化している
- Smoke Flow のいずれかのステップで GUI が遷移できない
- 再起動後にデータが消えている / status が変化している
- 上記いずれかが発生したら本チケットを fail とし、対応する修正チケットを Orchestrator が新規に作成する

## Out of scope

- ユーザーテスト (本人以外による操作確認)
- ユニットテスト追加 (Phase 2 では Rust 単体のみ必須)
- パフォーマンステスト
- 多言語対応
- Phase 1 既存技術的負債の解消 (QTM-009)
- Editor / Memory / Runs / Cron タブの実装 (placeholder のまま)
