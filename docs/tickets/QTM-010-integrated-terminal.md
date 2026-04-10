# Ticket

## Title

- QTM-010 Integrated Terminal and IDE Interop

## Goal

- active worktree を起点に、手動で `git` や CLI coding agent を実行できる統合ターミナルと、外部 IDE / OS ファイルマネージャ連携を提供する。

## Scope

- PTY terminal
- terminal tab 管理
- active worktree 連動
- Open in IDE / File Manager / Terminal
- terminal session lifecycle
- 手動 CLI 操作

## Done Criteria

- workspace から terminal を開ける
- active worktree または project root を起点に terminal が開始する
- 複数 terminal タブを開いて切り替えられる
- terminal で `git`、`claude code`、`codex` などを手動実行できる
- current worktree を VS Code / Cursor / Terminal / OS 標準ファイルマネージャで開ける
- terminal と CLI adapter run が同一 workspace で共存できる

## Validation

- terminal 起動確認
- worktree 連動確認
- 複数 terminal タブ確認
- `git status` と CLI coding agent 起動確認
- Open in IDE 導線確認

## Notes

- [L11-integrated-terminal.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L11-integrated-terminal.md)
- [L04-workspace-ux.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L04-workspace-ux.md)
- run 管理の代替ではなく補完機能として扱う
