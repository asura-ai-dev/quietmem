# L05 Agent Management

## Objective

Agent の定義、一覧管理、状態管理、複製を含む基礎運用機能を定義する。

## Scope

- agent 一覧
- agent CRUD
- agent 状態表示
- agent 複製

## Requirements

### 1. Agent Listing

- agent 一覧を表示できる
- 一覧上で agent の名前、role、状態を確認できる
- 一覧上で agent の現在の worktree や branch の要約を確認できることが望ましい

### 2. Agent Creation and Editing

- agent を作成できる
- agent を編集できる
- prompt_path と config_path を agent に紐付けられる
- adapter_type を agent に設定できる

### 3. Agent Duplication

- agent を複製できる
- 複製時に role、設定、prompt 紐付け、project memory 参照方針を引き継げること
- 複製時に agent 固有 memory は引き継がず、新しい agent memory は空で開始する
- 複製後は別 worktree / branch に接続できること

### 4. Agent Status

- status は idle / running / error / needs input を最低限サポートする
- 一覧と詳細の両方で状態を可視化する
- status は run 状態と整合する必要がある
- agent status は複数 run の集約結果として扱う
- 集約優先順位は `needs input > running > error > idle` とする

## Acceptance Criteria

- ユーザーは GUI から agent を作成、編集、複製できる
- 各 agent の現在状態が一覧から即座に判別できる
- 並列運用時に複数 agent の状態を見失わない
- 複製した agent が元 agent の個別 memory を引きずらない

## Non-Goals

- 複雑な権限管理
- agent 間の高度な handoff / fork 自動制御
