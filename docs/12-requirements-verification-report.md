# QuietMem Requirements Verification Report

## Scope

- 対象は `docs/` 配下の要件文書一式
- 実装コードは存在しないため、今回は仕様書監査として検証した
- 観点は整合性、MVP 境界、データモデル充足性、チケット分解の妥当性

## Overall Assessment

- 結論は `Conditional Pass`
- プロダクト像、MVP 範囲、チケット分解の大枠は一貫している
- ただし、そのまま実装に入ると設計判断がぶれやすい未定義項目が複数ある
- とくに memory の所有境界、status 状態機械、worktree のアクティブ選択ルールは先に固定すべき

## What Is Solid

- プロダクトの方向性は一貫している。チャットアプリではなく agent 運用ツールとして定義されている
- MVP の主要機能領域は `00-overview` と `L10` とバックログで揃っている
- チケット順は大筋で依存関係に沿っており、`QTM-001` から `QTM-009` まで段階実装しやすい
- Git 機能の非対象範囲と CLI adapter の責務境界は比較的明確

## Findings

### 1. Critical: memory テーブル設計が agent 単位要件を満たしていない

- `L03` では curated memory を `agent の長期記憶` と定義し、`agent ごとに raw / curated の両 memory を閲覧できる` ことを要求している
- しかし `L09` の draft tables では `curated_memories` と `raw_memory_entries` に `project_id` や `agent_id` がなく、agent 単位の所有・検索・一覧の成立根拠が弱い
- この状態だと memory のスコープ判定、昇格元追跡、agent 切替時の表示仕様が実装者依存になる

Evidence:
- [L03-memory-requirements.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L03-memory-requirements.md#L16) 
- [L03-memory-requirements.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L03-memory-requirements.md#L51)
- [L09-data-storage.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L09-data-storage.md#L39)

Recommendation:
- `curated_memories` と `raw_memory_entries` に少なくとも `project_id`、`agent_id`、`created_at`、`updated_at` を追加する
- raw から curated への昇格元を追跡するため `source_raw_memory_entry_id` または join テーブルを定義する

### 2. Critical: agent 複製時の memory 継承意味が未定義

- `L05` は複製時に `memory 参照方針を引き継げること` を要求している
- 一方で `L03` は curated memory を agent 固有の長期記憶として扱っている
- これでは複製時に memory を `共有` するのか、`スナップショットコピー` するのか、`空で作るがポリシーだけ引き継ぐ` のか決まらない

Evidence:
- [L05-agent-management.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L05-agent-management.md#L29)
- [L03-memory-requirements.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L03-memory-requirements.md#L18)

Recommendation:
- 複製モードを明示する
- 例: `copy curated only`、`share read-only references`、`empty memory with inherited rules`
- MVP は 1 方式に固定し、他方式は将来拡張に逃がす

### 3. High: agent status と run status の状態機械が不足している

- `L05` は agent status と run status の整合を要求している
- `L07` は run status 可視化と `needs input` の扱いを要求するが、許可状態、遷移条件、同時実行時の集約規則がない
- 複数 run が同時に走る前提なのに、agent 一覧に出す代表 status の決定ルールがない

Evidence:
- [L05-agent-management.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L05-agent-management.md#L35)
- [L07-run-execution-cli-adapter.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L07-run-execution-cli-adapter.md#L24)

Recommendation:
- `run_status` と `agent_status` を別列挙で定義し、遷移表を 1 つ追加する
- 例: `queued -> running -> completed|failed|cancelled|needs_input`
- agent status の集約規則も明文化する
- 例: `running` 優先、次に `needs_input`、次に `error`、最後に `idle`

### 4. High: workspace UX における chat 入力面の扱いが曖昧

- `L04` の右ペインには `agent chat` を置くとある
- `L07` の実行フローでは `prompt / task を入力する` とある
- ただし製品定義では QuietMem はチャットアプリではないことを強く打ち出している

Evidence:
- [L04-workspace-ux.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L04-workspace-ux.md#L22)
- [L07-run-execution-cli-adapter.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L07-run-execution-cli-adapter.md#L47)

Risk:
- 実装時に `チャット画面` と `run 実行フォーム` が二重化しやすい
- メモリ候補、現在メモリ、run actions と同居するため右ペインが過密になる

Recommendation:
- MVP では右ペインを `Run Console` と定義し直す
- `chat` ではなく `task input + latest interaction + action controls` の責務に絞る

### 5. High: worktree のアクティブ選択規則がない

- `L06` は agent ごとに worktree を管理し、branch 切替を GUI で行えるとしている
- `L07` の実行フローでも worktree 選択が必要
- しかし 1 agent に複数 worktree があるときの `現在の worktree` の定義、保存先、切替副作用が未定義

Evidence:
- [L06-editor-git-worktree.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L06-editor-git-worktree.md#L29)
- [L07-run-execution-cli-adapter.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L07-run-execution-cli-adapter.md#L47)

Recommendation:
- `active_worktree_id` の所有先を定義する
- 候補は `agents.active_worktree_id` または UI state
- `editor`、`run`、`diff`、`file tree` がどの worktree に従うかを 1 行で固定する

### 6. Medium: cron の運用ルールが MVP 実装には少し足りない

- `L08` には `timezone` はあるが、既定値、DST、アプリ停止中の missed run、再起動時 catch-up の扱いがない
- 内蔵 scheduler を選ぶなら、この辺りは挙動差がユーザー影響に直結する

Evidence:
- [L08-cron-management.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L08-cron-management.md#L24)
- [L09-data-storage.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L09-data-storage.md#L44)

Recommendation:
- MVP の簡易ポリシーを明記する
- 例: `default timezone = project timezone or local timezone`
- 例: `app 停止中の missed run は補完しない`

### 7. Medium: run 停止がチケットにあるが要件本体にない

- `QTM-006` の scope には `run start / stop / retry` が入っている
- しかし `L07` 本体は `retry` は定義している一方で `stop` を要件化していない
- チケット先行で入り込んだ機能に見える

Evidence:
- [QTM-006-run-execution-and-cli-adapter.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/tickets/QTM-006-run-execution-and-cli-adapter.md#L11)
- [L07-run-execution-cli-adapter.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L07-run-execution-cli-adapter.md#L16)

Recommendation:
- `stop / cancel` を MVP 必須にするなら `L07` に追記する
- 逆に不要なら `QTM-006` から外す

### 8. Medium: 非機能要件が不足している

- 現在の文書は機能分解は十分だが、性能・容量・安定性の最低線がない
- とくに raw memory 検索、巨大ログ表示、diff 表示、ファイルツリー走査は desktop app で詰まりやすい

Recommendation:
- MVP 用に最低限だけ追加する
- 例: 初回表示目標、検索応答目標、ログビューのストリーミング方針、巨大ファイルの制限

## Coverage Check

| Area | Coverage | Notes |
| --- | --- | --- |
| Product definition | Good | 方向性は明確 |
| Domain model | Fair | 関係はあるが所有境界が不足 |
| Memory | Fair | UX はあるが DB 設計が弱い |
| Workspace UX | Fair | 画面責務が一部曖昧 |
| Agent management | Fair | 複製 semantics と status 集約が不足 |
| Editor / Git / Worktree | Fair | active worktree 規則が不足 |
| Run / Adapter | Fair | 状態機械と stop/cancel が不足 |
| Cron | Fair | scheduler policy が不足 |
| Data storage | Fair | memory 系 FK と運用列が不足 |
| MVP roadmap / backlog | Good | 大枠は実装順として妥当 |

## Release Readiness View

- `MVP planning ready`: Yes
- `Detailed design ready`: No
- `Implementation start ready without clarification`: No

## Recommended Next Actions

1. `L09` を更新し、memory 系テーブルと参照関係を確定する
2. `L05` と `L07` の間に status state machine の短い節を追加する
3. `L05` に agent duplication の memory 継承方式を 1 つ明記する
4. `L04` と `L07` で右ペインの責務を `chat` ではなく `run console` として統一する
5. `L06` と `L08` に active worktree / cron scheduling policy を 2-3 行ずつ追加する
