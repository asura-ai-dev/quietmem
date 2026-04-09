# Ticket

## Title

- QTM-011 Parallel Agent Orchestration

## Goal

- 複数 agent を並列に起動し、agent ごとの run / worktree / terminal / diff をまとめて把握できる orchestration 導線を提供する。

## Scope

- orchestration view
- parallel agent launch
- swarm / batch task visibility
- agent-to-worktree mapping
- agent-to-terminal mapping

## Done Criteria

- 複数 agent を同時に起動できる
- agent ごとの状態を一覧表示できる
- 各 agent から worktree / terminal / diff / latest run へ移動できる
- swarm 的な並列開発をしても作業場が混線しない

## Validation

- 2 体以上の agent 並列起動確認
- state 一覧表示確認
- worktree / terminal / diff 遷移確認
- 並列実行時の分離確認

## Notes

- [L12-parallel-agent-orchestration.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L12-parallel-agent-orchestration.md)
- [L07-run-execution-cli-adapter.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L07-run-execution-cli-adapter.md)
- 自動 merge や自律 planner は MVP 対象外
