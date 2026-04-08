# QuietMem MVP Ticket Backlog

## Purpose

本書は QuietMem の MVP 実装を、実行順に追えるチケットへ分解したバックログである。

## Ticket List

| Ticket | Title | Goal |
| --- | --- | --- |
| QTM-001 | Project / Agent / Worktree Foundation | アプリ骨組み、永続化基盤、最低限 CRUD を成立させる |
| QTM-002 | Workspace Shell and Navigation | 日常利用の 1 画面ワークスペース骨格を作る |
| QTM-003 | Agent Management UI | agent 一覧、作成、編集、複製、状態表示を実装する |
| QTM-004 | Monaco Editor and File Tree | 編集体験とファイル参照を実装する |
| QTM-005 | Memory Management | project / agent 両スコープの raw / curated / digest memory と想起導線を実装する |
| QTM-006 | Run Execution and Adapter | CLI adapter による run 実行、ログ表示、履歴を実装する |
| QTM-007 | Git / Worktree Visibility | active worktree を前提に branch、changed files、diff、worktree 切替を実装する |
| QTM-008 | Cron Scheduling | cron job の CRUD、ON / OFF、手動実行、run 連携、Memory Digest 生成を実装する |
| QTM-009 | MVP Polish and Reliability | status 表示、エラーハンドリング、memory 候補、UX 調整を行う |

## Dependency Order

1. QTM-001
2. QTM-002
3. QTM-003
4. QTM-004
5. QTM-005
6. QTM-006
7. QTM-007
8. QTM-008
9. QTM-009

## Release Gate

- QTM-001 から QTM-008 までが完了していること
- QTM-009 で MVP 成功条件の見え方とエラー導線が整っていること
- [L10-mvp-scope-roadmap.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L10-mvp-scope-roadmap.md) の成功条件を GUI 上で確認できること
