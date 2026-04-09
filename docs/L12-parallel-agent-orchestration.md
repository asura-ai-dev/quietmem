# L12 Parallel Agent Orchestration

## Objective

QuietMem 内で複数 agent を並列に走らせ、agent ごとの worktree / terminal / run を分離しつつまとめて把握できる要件を定義する。

## Scope

- 複数 agent 並列実行
- swarm / batch run
- orchestration view
- task assignment
- run / worktree / terminal の関連把握

## Requirements

### 1. Parallel Agent Runs

- ユーザーは複数 agent を同時に実行できる
- 各 agent の run は独立した worktree と状態を持てる
- 並列 run 中も agent ごとのログと差分を分離して確認できる

### 2. Swarm Definition

- ユーザーは複数 agent をひとまとまりの swarm として扱える
- swarm は固定チームでなく、その時点の task batch として作成できる
- swarm ごとに対象 project、agent 群、対象 branch / worktree を把握できる

### 3. Task Assignment

- ユーザーは task を 1 件ずつ agent に割り当てられる
- ユーザーは複数 task をまとめて複数 agent に配布できる
- task ごとに担当 agent、worktree、最新状態を追跡できる

### 4. Orchestration Visibility

- workspace または dashboard から swarm / 並列 run の一覧を確認できる
- 各 agent について `idle`、`running`、`needs input`、`error`、`done` 相当の状態を一覧表示できる
- 各 agent の active worktree、最新 run、terminal、diff への導線を持てる

### 5. Isolation

- 並列実行中の agent は原則として別 worktree で隔離される
- ある agent の変更が他 agent の editor / diff / terminal に混線しない
- review や統合作業は agent 実行とは別導線で扱う

### 6. Relation To Run Execution

- orchestration は `run` をまとめて扱う上位 UX である
- 単一 agent 実行は L07 の run 機能で成立する
- swarm は複数 run と複数 worktree と複数 terminal を束ねる表示 / 操作層である

### 7. MVP Scope

- MVP では軽量な orchestration view を提供する
- 複数 agent を並列起動できる
- agent ごとの状態、worktree、diff、terminal へ遷移できる
- 自動 task 分割や自律的 merge は MVP 対象外とする

## Acceptance Criteria

- ユーザーは複数 agent を同時に起動して状態を一覧できる
- 各 agent の worktree / terminal / diff / latest run へ素早く移動できる
- swarm 的な並列開発をしても作業場が混線しない

## Non-Goals

- 完全自律型 multi-agent planner
- 自動 merge / 自動 PR 作成 / 自動 conflict 解決
- 大規模組織向け権限管理やレビュー承認フロー
