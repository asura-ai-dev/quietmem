# Phase 2: Agent Status Enum 設計

## 概要

`agents.status` の有効値を 4 値 (`idle` / `running` / `error` / `needs_input`) に揃え、Rust 側ホワイトリスト + TS 側型定義 + DB 互換性方針を一貫させる。本ドキュメントは write 経路のバリデーション点と read 経路の前方互換性を両方扱う。

## 仕様からの対応

- spec.md §2.2 status enum 化 (バックエンド側の緩い検証)
- spec.md §2.3 アプリケーション層の status enum
- spec.md §2.4 型定義
- spec.md §4.6 Agent Status 表示
- spec.md §5.1 / §5.2 データ層変更
- spec.md §7.5 受け入れ条件 (Status 表示)

## 有効値の確定

```
idle          : ニュートラル / muted (既定値)
running       : 実行中 (sage = primary)
error         : エラー (新規 danger 色)
needs_input   : ユーザー入力待ち (amber)
```

- DB の DEFAULT は Phase 1 から `'idle'` 固定 (変更しない)
- 順序は表示順 (UI の select option) に揃える
- `running` は Phase 1 の単体テスト (`update_with_none_fields_preserves_existing_values`) で既に投入されているため、ホワイトリストに必ず含める

## Rust 側設計

### 1. 定数定義 (推奨: モジュール定数)

`src-tauri/src/domain/agent.rs` に追加する。`enum` ではなく `&'static str` 配列にすることで、既存 `Agent.status: String` を変更せずに済む (前方互換)。

````rust
// src-tauri/src/domain/agent.rs

/// `agents.status` の有効値ホワイトリスト。
///
/// write 経路 (create / update / duplicate) で参照する。
/// read 経路では検証しない (DB 互換性のためのエスケープハッチ)。
///
/// Phase 2 では文字列の Vec / Set ではなく、`&[&'static str]` で十分。
pub const AGENT_STATUS_VALUES: &[&str] = &["idle", "running", "error", "needs_input"];

/// status 文字列の正当性を検証する。
///
/// `AGENT_STATUS_VALUES` のいずれかにマッチすれば `Ok(())`。
/// マッチしなければ `AppError::InvalidInput` を返す。
///
/// 呼び出し例:
/// ```ignore
/// validate_agent_status(&new_status)?;
/// ```
pub fn validate_agent_status(status: &str) -> AppResult<()> {
    if AGENT_STATUS_VALUES.contains(&status) {
        Ok(())
    } else {
        Err(AppError::InvalidInput(format!(
            "status must be one of {} (got: {:?})",
            AGENT_STATUS_VALUES.join("|"),
            status
        )))
    }
}
````

- `enum AgentStatus { Idle, Running, Error, NeedsInput }` 化は **行わない**。理由:
  - 既存 `Agent.status: String` をそのまま使い続けたい (DB 読み戻しで失敗しない)
  - Phase 2 では UI 側の制限が主目的であり、Rust 側はホワイトリストで足りる
  - QTM-009 で本格的な enum 化を行う方針 (spec.md §3 / §10)

### 2. write 経路への組み込み

`src-tauri/src/db/repo/agent.rs` の以下 3 関数で検証する。

#### create

```rust
// 既存ロジックの「デフォルト適用」直後に検証を挟む
let status = input
    .status
    .filter(|s| !s.is_empty())
    .unwrap_or_else(|| "idle".to_string());
validate_agent_status(&status)?;
```

#### update

```rust
// 既存ロジックの「new_status 決定」直後に検証を挟む
let new_status = input.status.unwrap_or_else(|| existing.status.clone());
// 既存値が範囲外でも、明示的に同じ値を上書きしただけなら通す方針もあるが、
// シンプルに「常にバリデート」する。
validate_agent_status(&new_status)?;
```

注: 既存 DB に範囲外値が入っていた場合、ユーザーが他フィールドだけ更新しようとしても reject される可能性がある。これは Phase 1 のテストデータ (`running`) は範囲内のため実害なし。「無関係フィールドのみ更新時は status を再検証しない」最適化は **行わない** (実装が複雑になるため)。

#### duplicate

```rust
// 強制的に "idle" で開始する (spec.md §2.2)
let new_status = "idle".to_string();
// 念のため検証 (将来 "idle" を変更したときの保険)
validate_agent_status(&new_status)?;
```

### 3. read 経路は触らない

`list_by_project` / `find_by_id` の SELECT 後に `validate_agent_status` を呼ばない。これにより、DB に範囲外値が入っていても read は失敗しない。

## TS 側設計

### bindings.ts

```ts
// src/types/bindings.ts

export type AgentStatus = "idle" | "running" | "error" | "needs_input";

/**
 * Agent.status は Rust 側ホワイトリスト経由で必ず正規化された値を返す前提だが、
 * DB に既存範囲外値が残っているケースを救済するため `string` ユニオンを許容する。
 *
 * UI 側で render するときは AGENT_STATUS_VALUES.includes() で安全側に倒し、
 * 範囲外なら "idle" 相当の muted バッジを描画する。
 */
export interface Agent {
  // ...既存フィールド...
  status: AgentStatus | string;
  // ...
}

export interface AgentCreateInput {
  // ...
  status?: AgentStatus; // 厳格化: 自由文字列を受け付けない
}

export interface AgentUpdateInput {
  // ...
  status?: AgentStatus;
}
```

### 定数

```ts
// src/types/bindings.ts または src/features/agents/agentStatus.ts

export const AGENT_STATUS_VALUES = [
  "idle",
  "running",
  "error",
  "needs_input",
] as const satisfies readonly AgentStatus[];

export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  idle: "idle",
  running: "running",
  error: "error",
  needs_input: "needs input",
};
```

`AGENT_STATUS_LABELS` の `needs input` (スペース入り) は表示用、enum 値は `needs_input` (アンダースコア) という分離を必ず守る。

## DB 互換性方針

| 観点                           | 方針                                                          |
| ------------------------------ | ------------------------------------------------------------- |
| カラム型変更                   | しない (`TEXT NOT NULL DEFAULT 'idle'` のまま)                |
| マイグレーション追加           | しない                                                        |
| 既存範囲外値への対応 (read)    | 何もしない (UI で muted フォールバック)                       |
| 既存範囲外値への対応 (write)   | reject (`InvalidInput`)                                       |
| Phase 1 で投入された `running` | ホワイトリストに含まれているため影響なし                      |
| 将来 enum 値を増やすとき       | `AGENT_STATUS_VALUES` に追記 + bindings.ts のユニオン拡張のみ |

## バリデーションの呼び出しチェーン

```
agent_create command
   └─> repo::agent::create
         └─> validate_agent_status (after default applied)

agent_update command
   └─> repo::agent::update
         └─> validate_agent_status (after merge with existing)

agent_duplicate command
   └─> repo::agent::duplicate
         └─> validate_agent_status (always "idle")
```

## テスト方針 (Rust)

- `validate_agent_status` の単体テスト
  - 4 値それぞれが Ok を返す
  - 範囲外値 (`"unknown"`, `""`, `"Idle"` (大文字)) が `InvalidInput` を返す
- `repo::agent::create` の追加テスト
  - 範囲外 status で `InvalidInput`
- `repo::agent::update` の追加テスト
  - 範囲外 status で `InvalidInput`
- 既存 `update_with_none_fields_preserves_existing_values` (status `"running"`) は引き続き pass する

## 制約・注意事項

- ホワイトリスト判定は `==` でケースセンシティブ (`"Idle"` は無効)
- フロント側 select の `value` 属性は必ず enum 値 (`needs_input`)、表示テキストは `needs input` を使う
- bindings.ts の `Agent.status` をユニオン化することで、Phase 1 の文字列直書きコード (`agent.status === "idle"`) も型エラーにならず継続使用可能
- ホワイトリストの順序は固定 (UI 側 select の option 順を兼ねる)
