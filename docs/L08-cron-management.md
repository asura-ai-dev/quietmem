# L08 Cron Management

## Objective

agent の定期実行を QuietMem 内で管理するため、cron job の定義、制御、履歴管理の要件を定義する。

## Scope

- cron job CRUD
- ON / OFF
- 手動実行
- run 紐付け
- 今後の拡張境界

## Requirements

### 1. Cron in MVP

- cron job の作成機能を提供する
- cron job の実行機能を提供する
- cron job の ON / OFF 切替機能を提供する
- cron 実行履歴の確認機能を提供する
- 通常の agent task 実行 cron と `Memory Digest` cron を提供する

### 2. Scheduling Model

- cron 実行方式はアプリ内蔵スケジューラとする
- cron 定義は SQLite に保存する
- 指定時刻に対象 agent を起動できる
- 実行結果は Run として保存する
- GUI から enabled 状態を変更できる
- `Memory Digest` cron は daily / weekly / monthly / yearly の curated digest を生成できる
- `Memory Digest` cron は同一 scope 内の memory だけを材料にする
- MVP では digest は設定以後の未来分のみ自動生成し、過去分の自動バックフィルは行わない

### 3. Cron UI

- cron job 一覧を表示できる
- cron job を作成できる
- cron job を編集できる
- 手動実行できる
- 対応する run 履歴へ遷移または参照できる

### 4. Future Expansion Boundary

- 条件起動は将来拡張とする
- memory に基づく次タスク提案は将来拡張とする
- 高度な自動運用は将来拡張とする
- 自動反映前の review required モードは将来拡張とし、環境変数で切り替え可能にする

## Acceptance Criteria

- ユーザーは agent 単位で定期実行設定を作成できる
- cron 実行結果が run として一元的に追跡できる
- 手動実行と定期実行でログ確認体験が分断されない
- Memory Digest によって time-based curated memory が育つ

## Non-Goals

- 複雑なイベント駆動オートメーション
- 高度な自律エージェント判断によるスケジュール変更
