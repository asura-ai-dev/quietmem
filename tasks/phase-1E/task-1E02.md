# Task 1E02: Header / LeftSidebar / RightPanel コンポーネント

## Objective

Header / LeftSidebar / RightPanel の 3 コンポーネントを実装する。中身は Phase 1 用の最小構造 (ナビゲーションリンク、Interaction Panel の 3 セクションなど)。

## Scope

- `src/shell/Header.tsx`
  - 左: アプリ名 `QuietMem`
  - 右: `Dashboard` / `Settings` のリンク button (click で `uiStore.setRoute` を呼ぶ)
- `src/shell/LeftSidebar.tsx`
  - 上部: `Projects` ラベル
  - 下部: `projectStore.projects` を `<ul>` でリスト表示 (click で `selectProject(id)`)
  - 選択中 project の agent セクションを表示するプレースホルダ (実データ表示は 1F で統合)
- `src/shell/RightPanel.tsx`
  - `TaskInputSection`: `<textarea disabled placeholder="次のタスク" />` + `<button disabled>Run</button>`
  - `LatestInteractionsSection`: 見出し + `まだ実行がありません`
  - `MemoryContextPreviewSection`: 見出し + `参照中の memory はありません`
- 各コンポーネントの CSS Modules ファイル
- `WorkspaceRoute.tsx` の placeholder を各コンポーネントで置き換え

## Implementation Notes

- 参照: `agent-docs/ui-shell.md`
- Header の Dashboard / Settings ボタンは click で `useUiStore.setRoute("dashboard")` / `("settings")` を呼ぶ
- LeftSidebar はこの時点では `projectStore.projects` を参照するが、refresh は 1F01 で追加するため表示は空配列でよい
- RightPanel の 3 セクションは `<section>` タグで区切り、見出しは `<h3>` 程度
- デザイントークンのセージグリーン (`--accent-primary`) を少なくとも 1 箇所で使う (選択中 project のハイライト等)
- アンバー (`--accent-attention`) はラベルまたは注意表示に使う (空状態テキスト等)

## Depends On

- task-1E01
- task-1D03
- task-1D04
