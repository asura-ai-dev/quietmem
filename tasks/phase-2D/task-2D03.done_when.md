# task-2D03 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
cd src-tauri && cargo test --lib && cargo build && cd ..

# 手動 smoke (実 GUI)
pnpm tauri dev   # 起動 → spec.md §11 Smoke Flow を実施 → 終了
pnpm tauri dev   # 再起動 → データ保持確認 → 終了

# DB 直接検証 (macOS の AppData パス例)
sqlite3 ~/Library/Application\ Support/QuietMem/db/quietmem.sqlite \
  "SELECT id, name, status, active_worktree_id FROM agents WHERE name LIKE 'planner%';"
sqlite3 ~/Library/Application\ Support/QuietMem/db/quietmem.sqlite \
  "SELECT COUNT(*) FROM raw_memory_entries; SELECT COUNT(*) FROM curated_memories;"
```

## チェック項目

### 自動検証

- `pnpm tsc --noEmit` が exit 0
- `pnpm build` が success
- `cargo test --lib` が全 pass (Phase 2A の追加分含む)
- `cargo build` が success

### Smoke Flow 完遂 (spec.md §11)

- 既存 Project を選択 → LeftSidebar Agents セクションが実 Agent 一覧 (placeholder ではない) を表示
- New Agent フォームから Agent A (planner) を作成 → 一覧に表示
- 一覧の status バッジが `idle` (muted) で表示される
- 編集フォームを開く → 「複製」ボタンが存在する
- 複製ボタン押下 → AgentDuplicateConfirm が表示される
- 確認 UI 内に以下のテキストが含まれる:
  - 「memory」 (raw / curated を含む)
  - 「active worktree」
  - 「idle で開始」または「status (idle」
- 「複製を実行」押下 → Agent A2 (`planner (copy)`) が一覧に追加される
- 編集フォームが Agent A2 に切り替わる (selectedAgentId 更新)
- Agent A2 の status を `running` に変更し保存できる
- Agent A2 の active worktree を既存 worktree に紐付けて保存できる
- 一覧 (Overview / LeftSidebar) で A (`idle`) と A2 (`running`) のバッジが視覚的に区別される
- アプリ再起動後、Agent A / A2 がともに表示され、A2 の status が `running`、active_worktree_id が non-null

### sqlite3 検証

- `agents` テーブルに `planner` と `planner (copy)` の 2 行が存在
- 両者の `id` が異なる
- 両者の `created_at` が異なる
- A2 の `status = 'running'` (Smoke 後)
- A2 の `active_worktree_id` が non-null (Smoke 後)
- `raw_memory_entries` の COUNT が 0
- `curated_memories` の COUNT が 0

### 4 status バッジ視覚確認

- `idle` バッジ (muted / gray border) を視認できる
- `running` バッジ (sage 緑系) を視認できる
- `error` バッジ (red 系) を視認できる
- `needs_input` バッジ (amber 橙系) を視認できる
- 4 値とも色 + テキストの両方で識別できる
- needs_input のラベルが `needs input` (スペース入り) で表示される

### handoff 作成

- `agent-output/phase-2-smoke-status.md` ファイルが新規作成されている
- ファイル内に Smoke Flow の各ステップ結果 (pass / fail) が記録されている
- sqlite3 検証の出力が記録されている

### スタブ検出 (spec.md §13.7)

- 複製ボタンが UI だけで Tauri command を呼んでいないという疑似実装になっていない
  - DB 直接検証で新行が増えていることを確認
- LeftSidebar Agents セクションが疑似データを返していない
  - DB 直接検証で表示内容と DB 行が一致することを確認
- status バッジの色が tokens.css の semantic alias 経由になっている (raw 色値直書きなし)
- 確認 UI の「memory を引き継がない」テキストと repo::agent::duplicate の挙動が矛盾していない (Phase 2A の単体テストで担保済)
