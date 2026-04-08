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
- 右ペインに agent chat、current memory、memory 候補、run actions を配置する
- 下部ドロワーに diff、logs、problems、output を配置する

### 3. Separate Screens

- Dashboard は別画面を許可する
- Settings は別画面を許可する
- 初回セットアップは別画面を許可する

### 4. Core User Flow

- ユーザーは agent を選択できる
- ユーザーは memory を確認できる
- ユーザーは editor で作業できる
- ユーザーは run を実行できる
- ユーザーは重要情報を memory に残せる

### 5. Required Screens

- Agent 一覧 / Dashboard 画面
- Agent 詳細画面
- Memory 画面
- Editor 画面
- Run / Log 画面
- Cron Job 管理画面

## Acceptance Criteria

- 主要業務フローが 1 つの workspace 内で完結する
- editor、memory、run、diff が同時に参照可能なレイアウトになっている
- 日常利用で頻繁な全画面遷移を要求しない

## Non-Goals

- 複雑なマルチウィンドウ運用
- コンシューマーアプリ的なカード中心 UI
