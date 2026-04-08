# L03 Memory Requirements

## Objective

QuietMem の memory を Raw Memory と Curated Memory の 2 層構造として定義し、保存・検索・昇格の要件を明確にする。

## Scope

- memory モデル
- raw memory 保存 / 検索
- curated memory 管理
- raw から curated への昇格

## Requirements

### 1. Memory Model

- QuietMem は Raw Memory と Curated Memory の 2 層構造を採用する
- Raw Memory は生データを全文ベースで保持する層とする
- Curated Memory は agent の長期記憶として使う整理済み情報とする

### 2. Raw Memory Content

- 会話ログを保存できる
- 実行ログを保存できる
- ファイル変更履歴を保持できる
- タスク履歴を保持できる
- 実行結果を保持できる

### 3. Curated Memory Content

- ユーザーの好みを記録できる
- 重要方針を記録できる
- プロジェクト決定事項を記録できる
- 継続タスクを記録できる

### 4. Memory Operations

- raw memory 本文を保存できる
- raw memory を検索できる
- curated memory を表示できる
- curated memory を編集できる
- raw memory から curated memory へ昇格できる

### 5. Positioning

- Raw Memory は MemPalace 型の全文保存と検索の役割を持つ
- Curated Memory は OpenClaw 型の重要情報整理の役割を持つ
- QuietMem は両者を統合したハイブリッド構造を提供する

## Acceptance Criteria

- agent ごとに raw / curated の両 memory を閲覧できる
- raw memory から重要事項を curated memory へ手動昇格できる
- 長文データを保持しつつ、日常操作では curated memory を優先参照できる

## Non-Goals

- memory graph 可視化
- 高度な自動分類
- 高度な自律的 memory 要約
