# Ticket

## Title

- QTM-006 Run Execution and CLI Adapter

## Goal

- CLI adapter 経由で agent を実行し、並列 run、ログ表示、履歴、再試行を扱えるようにする。

## Scope

- adapter interface
- Claude Code adapter 初版
- run start / stop / retry
- run status 反映
- needs input 再開
- log panel
- run history
- interaction panel 連携

## Done Criteria

- GUI から agent run を開始できる
- 実行ログを確認できる
- run 履歴を一覧できる
- run の再試行ができる
- input 待ちを `needs input` として表現できる
- `needs input` から同一 run を再開できる
- run ごとの interaction log を表示できる

## Validation

- adapter 単体確認
- 1 agent 実行確認
- 複数 agent 並列実行確認
- ログ保存確認
- needs input 再開確認

## Notes

- [L07-run-execution-cli-adapter.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L07-run-execution-cli-adapter.md)
- Adapter の責務を広げすぎないこと
