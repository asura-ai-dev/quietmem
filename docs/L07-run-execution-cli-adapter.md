# L07 Run / Execution / CLI Adapter

## Objective

ローカル CLI 型 agent を QuietMem から実行し、並列実行、ログ表示、履歴管理を行うための要件を定義する。

## Scope

- run 実行管理
- 並列実行
- ログ / 履歴
- CLI adapter 責務

## Requirements

### 1. Run Management

- ローカル CLI 型 agent を GUI から実行できる
- 並列実行をサポートする
- 実行ログ全文を表示できる
- run 履歴を表示できる
- retry を実行できる
- stop / cancel を実行できる

### 2. Run Status

- run status を可視化できる
- agent status と run status の整合を保つ
- input 待ち状態を needs input として扱える
- run status は `queued`、`running`、`needs_input`、`succeeded`、`failed`、`cancelled` を持つ
- `needs_input` は失敗ではなく一時停止状態であり、ユーザー入力後に同一 run を再開できる

### 3. CLI Adapter Scope

- Adapter はコマンド生成を担う
- Adapter は process 起動を担う
- Adapter は stdout / stderr 取得を担う
- Adapter は status 変換を担う
- Adapter は input 待ち判定を担う
- Adapter は完了 / 失敗判定を担う

### 4. CLI Adapter Non-Responsibilities

- memory 検索は Adapter の責務に含めない
- cron 管理は Adapter の責務に含めない
- DB 保存は Adapter の責務に含めない
- worktree 作成は Adapter の責務に含めない
- UI 判断は Adapter の責務に含めない

### 5. MVP Execution Flow

- Agent を選ぶ
- active worktree を確認する
- memory scope を確認する
- prompt / task を入力する
- Run を実行する
- log / status / diff を見る
- curated memory を更新する
- 不足時に on-demand memory loading で追加文脈を読む

### 6. Relation To Integrated Terminal

- CLI adapter はアプリ主導で agent を実行するための基盤である
- 統合ターミナルはユーザー主導の任意コマンド実行であり、別要件として扱う
- terminal から `claude code` や `codex` を直接実行するケースを許容する
- run 履歴 / 状態管理は CLI adapter 側の責務とする
- 複数 agent orchestration は、この run 機能を束ねる上位 UX として別要件で扱う

## Acceptance Criteria

- GUI から CLI agent を起動し、状態遷移を追跡できる
- 複数 agent を同時実行しても一覧上で状態を識別できる
- Adapter の責務が過剰に肥大化していない
- needs input から同一 run を再開できる

## Non-Goals

- OpenClaw 以外の多実行系を MVP 時点で完全対応すること
- 自律判断に基づく高度な run orchestration
