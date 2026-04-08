# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo build
cargo test --lib
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

### ビルドとテスト

- `cargo build` 成功
- `cargo test --lib` 全件成功
- `pnpm tsc --noEmit` エラーなし
- `pnpm build` 成功

### 手動確認 (pnpm tauri dev で確認)

- DB ファイルを削除した状態で起動すると初回セットアップ画面が表示される
- 初回セットアップから Project 作成すると Workspace Shell に遷移する
- Overview タブで作成した Project が表示される
- Agent を Project 配下に作成できる
- Worktree を Project 配下に作成できる
- Agent 編集フォームで activeWorktreeId に Worktree を割り当てられる
- 保存後、Agent 一覧に activeWorktreeId が反映されている
- MainTabs の 5 タブ (Overview / Editor / Memory / Runs / Cron) が切り替わる
- BottomDrawer を開閉できる
- Header から Dashboard / Settings の別画面に遷移でき、「ワークスペースに戻る」で戻れる
- アプリを終了 → 再起動後も Project / Agent / Worktree と active_worktree_id が保持されている
- RightPanel がチャット UI ではなく Interaction Panel (task input / latest interactions / memory context preview) の構造で表示されている
- セージグリーン / ダークグレー / アンバーの 3 色が Shell 内で使われている

### DB / ファイル

- `~/Library/Application Support/QuietMem/db/quietmem.sqlite` が存在する (または directories crate の ProjectDirs 結果の下)
- SQLite に `projects`, `agents`, `worktrees`, `runs`, `raw_memory_entries`, `curated_memories` の 6 テーブルが存在する
