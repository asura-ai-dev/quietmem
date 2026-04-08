# L03 Memory Requirements

## Objective

QuietMem の memory を Raw Memory と Curated Memory の 2 層構造として定義し、保存・検索・昇格の要件を明確にする。

## Scope

- memory モデル
- memory scope
- raw memory 保存 / 検索
- curated memory 管理
- raw から curated への昇格
- digest 生成
- 想起フロー

## Requirements

### 1. Memory Model

- QuietMem は Raw Memory と Curated Memory の 2 層構造を採用する
- Raw Memory は生データを全文ベースで保持する層とする
- Curated Memory は agent の長期記憶として使う整理済み情報とする
- Raw Memory と Curated Memory は `project` と `agent` の両スコープを持てる

### 2. Memory Scope

- `project raw memory` と `agent raw memory` の両方を保持できる
- `project curated memory` と `agent curated memory` の両方を保持できる
- 想起時の参照優先順位は `agent -> project` とする
- agent 複製時は `agent memory` を引き継がず空で開始し、`project memory` のみ共有参照する

### 3. Raw Memory Content

- `project raw memory` はプロジェクト全体の決定ログを保存できる
- `project raw memory` は複数 agent にまたがる run の概要や結果を保存できる
- `project raw memory` は共通ファイル変更の要約を保存できる
- `project raw memory` はユーザーが残す project レベルのメモを保存できる
- `project raw memory` は重要な外部イベントを保存できる
- `project raw memory` は再発しうる agent の失敗やバグを保存できる
- `agent raw memory` は interaction log を保存できる
- `agent raw memory` は個別 run の詳細ログを保存できる
- `agent raw memory` はその agent が触ったファイル変更要約を保存できる
- `agent raw memory` はその agent 固有のタスク履歴を保存できる
- `agent raw memory` はその agent 固有の失敗メモや試行錯誤を保存できる
- 個別 agent 起点の事象の正本は `agent raw memory` とし、必要なものだけ `project raw memory` に参照付きで反映する

### 4. Curated Memory Content

- Curated Memory は `manual notes`、`promoted notes`、`digest` の 3 種を持つ
- `project curated memory` と `agent curated memory` はいずれも上記 3 種を持てる
- `manual notes` は人が明示的に書き残す確定知識ノートである
- `promoted notes` は raw memory から昇格した重要事項ノートである
- `digest` は時間単位で積み上がる要約型 curated memory である

- ユーザーの好みを記録できる
- 重要方針を記録できる
- プロジェクト決定事項を記録できる
- 継続タスクを記録できる

### 5. Digest

- Memory Digest は curated memory の一種として扱う
- Memory Digest は `daily`、`weekly`、`monthly`、`yearly` の粒度を持つ
- `daily digest` は同一 scope の当日 raw memory を主材料に生成する
- `weekly digest` は `daily digest` を主材料にし、必要時のみ同一 scope の raw memory に戻れる
- `monthly digest` は `weekly digest` を主材料にし、必要時のみ下位へ戻れる
- `yearly digest` は `monthly digest` を主材料にし、必要時のみ下位へ戻れる
- digest は `title`、`summary`、`key_points`、`source_refs`、`timeframe` を持つ
- digest の自動生成は `Memory Digest` cron によって行う
- digest は設定以後の未来分のみ自動生成し、過去分の自動バックフィルは MVP 対象外とする

### 6. Memory Operations

- raw memory 本文を保存できる
- raw memory を検索できる
- curated memory を表示できる
- curated memory を編集できる
- raw memory から curated memory へ昇格できる
- promoted note は必ず元 raw memory への参照を持つ
- project raw memory に自動反映された項目は `keep`、`dismiss`、`promote to curated` を選べる
- `dismiss` は project raw memory からのみ外し、元 agent raw memory は保持する
- `promote to curated` は project curated memory へ保存する

### 7. Recall Flow

- QuietMem の memory は単なる全文検索ではなく、自然に思い出せる想起導線を重視する
- 想起は `recent -> digest 階層 -> source refs -> related context` の順で拡張する
- `related context` は `semantic similarity`、自動推定の `topic tags`、`temporal proximity` を併用して取得する
- topic tags はシステムが自動推定する
- semantic search の対象は raw memory と curated memory の両方とする
- run 前の memory 注入は curated memory を優先し、不足時のみ raw memory や下位 digest を追加探索する
- 追加探索は on-demand loading とし、QuietMem の自動導線と agent 自身の追加要求の両方を許可する
- on-demand loading は `scope`、`timeframe`、`type`、`relation` を軸に絞り込める

### 8. Positioning

- Raw Memory は記録の正本として機能する
- Curated Memory は想起と継続運用のための整理済み記憶として機能する
- Digest は人が時間単位で思い出す流れを支える階層 memory として機能する
- QuietMem は全文保存、整理、時間階層想起を統合したハイブリッド memory を提供する

## Acceptance Criteria

- project / agent の両スコープで raw / curated を閲覧できる
- raw memory から重要事項を curated memory へ手動昇格できる
- promoted note から元 raw memory と前後文脈へ辿れる
- 長文データを保持しつつ、日常操作では curated memory と digest を優先参照できる
- run 前に curated memory を優先注入し、不足分だけ on-demand loading できる

## Non-Goals

- memory graph 可視化
- 高度な自動分類
- 過去全 raw memory の自動バックフィル
