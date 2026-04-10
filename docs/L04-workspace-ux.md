# L04 Workspace UX

## Objective

QuietMem の日常操作を 1 画面中心で成立させるため、画面構成と主要 UX フローを定義する。

## Scope

- 画面構成方針
- ペイン構成
- 主要スクリーン
- 基本操作フロー

## Requirements

### 1. Screen Policy

- 日常利用は 1 画面中心とする
- 重い設定系のみ別画面を許可する
- 普段の操作は画面遷移よりタブ切替を優先する

### 2. Primary Workspace Layout

- 左ペインに agent 一覧、file tree、global nav を配置する
- 中央に editor / memory / runs / cron / overview のタブを配置する
- 右ペインは `Interaction Panel` とし、task input、latest interactions、memory context preview、on-demand memory loading controls、run actions を配置する
- 下部ドロワーに diff、logs、problems、output、terminal を配置する
- workspace から current worktree を外部 IDE や OS 標準ファイルマネージャ / Terminal で開ける導線を持つ

### 3. Separate Screens

- Dashboard は別画面を許可する
- Settings は別画面を許可する
- 初回セットアップは別画面を許可する

### 4. Core User Flow

- ユーザーは agent を選択できる
- ユーザーは memory を確認できる
- ユーザーは editor で作業できる
- ユーザーは run を実行できる
- ユーザーは terminal から手動コマンドを実行できる
- ユーザーは複数 agent の並列状態を見ながら担当 worktree / terminal へ移動できる
- ユーザーは重要情報を memory に残せる
- ユーザーは Interaction Panel から最新対話、参照中 memory、追加 memory 読み込みを確認できる

### 5. Required Screens

- Agent 一覧 / Dashboard 画面
- Agent 詳細画面
- Memory 画面
- Editor 画面
- Run / Log 画面
- Integrated Terminal
- Parallel Agent Dashboard / Orchestration View
- Cron Job 管理画面

## Acceptance Criteria

- 主要業務フローが 1 つの workspace 内で完結する
- editor、memory、run、diff、terminal が同時に参照可能なレイアウトになっている
- 並列 agent 運用時に誰がどの worktree / terminal / run を持っているか分かる
- 日常利用で頻繁な全画面遷移を要求しない
- 右ペインがチャット主役ではなく run と想起補助のパネルとして機能する

## Non-Goals

- 複雑なマルチウィンドウ運用
- コンシューマーアプリ的なカード中心 UI
