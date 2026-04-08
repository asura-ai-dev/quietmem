# L02 Domain Model

## Objective

QuietMem の主要エンティティと関係性を定義し、以後のデータ設計と画面設計の基礎を固める。

## Scope

- Project 配下の管理単位
- Agent の定義
- Entity 関係
- 最小データ単位

## Requirements

### 1. Entity Hierarchy

- Project は複数 Agent を保持できる
- Project は Files と Cron Jobs を保持できる
- Project は project scope の Raw Memory と Curated Memory を保持できる
- Agent は Prompt / Config / Memory / Runs / Worktree に紐付く
- Agent は agent scope の Raw Memory と Curated Memory を保持できる

### 2. Agent Definition

- agent はドキュメントではなく AI ワーカー定義として扱う
- agent は role、設定、memory、実行方法、worktree 紐付けを持つ
- agent は「誰が作業するか」を表す単位とする
- agent は `active_worktree_id` を持ち、現在の作業場を 1 つ選択する

### 3. Responsibility Separation

- prompt / config / memory は「どう振る舞うか」を表す
- files / documents は「何を触るか」を表す
- runs は「何を実行したか」を表す
- worktree は「どこで作業するか」を表す
- interaction log は run 単位の対話正本を表す
- project memory は共有知識を表し、agent memory は個別文脈を表す

### 4. Minimum Data Units

- Project
- Agent
- Worktree
- Run
- CronJob
- CuratedMemory
- RawMemoryEntry
- MemoryDigest
- FileArtifact

## Acceptance Criteria

- Agent、Project、Run、Worktree、Memory の役割が重複なく定義されている
- 主要な UI と DB テーブルが上記エンティティへ自然に対応づけられる
- 将来の adapter 追加や cron 追加をしても Agent 定義が破綻しない
- project scope と agent scope の memory 境界が自然に表現できる

## Non-Goals

- 複雑な組織階層や権限制御の定義
- 複数 Project 横断の高度なナレッジグラフ設計
