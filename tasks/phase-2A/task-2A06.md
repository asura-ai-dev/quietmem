# task-2A06: Phase 2A 検証 (cargo test / build / clippy)

## Phase

2A

## Depends on

- task-2A02
- task-2A05

## Goal

Phase 2A 全タスク完了後、Rust バックエンド全体が壊れていないことを確認する。`cargo test --lib` / `cargo build` / `cargo clippy -- -D warnings` を全て通し、Phase 2A の出力を Phase 2B に引き渡せる状態にする。

## Scope

- 検証のみ (コード変更なし)
- ただし `cargo clippy -- -D warnings` で発覚した修正は本チケット内で対応する (3 行以下に収まる軽微なものに限る。それ以上は別チケット化する)

## Implementation Notes

### 検証手順

1. `cargo build` を実行し、コンパイルエラーがないことを確認
2. `cargo test --lib` を実行し、全テストが pass することを確認
3. `cargo clippy --all-targets -- -D warnings` を実行し、warning がないことを確認
4. テスト総数を Phase 1 完了時点 (39 tests) と比較し、新規テスト (約 14 件: status 検証 5 + duplicate 8 + DTO deserialize 1〜2) が追加されていることを確認

### Phase 2A の期待 deliverable まとめ

- `src-tauri/src/domain/agent.rs`
  - `AGENT_STATUS_VALUES` 定数
  - `validate_agent_status` 関数
  - `AgentDuplicateInput` 構造体
- `src-tauri/src/db/repo/agent.rs`
  - `create` 内で status バリデーション
  - `update` 内で status バリデーション
  - `duplicate` 関数
  - 単体テスト約 12 件追加
- `src-tauri/src/commands/agent.rs`
  - `agent_duplicate` command
- `src-tauri/src/lib.rs`
  - invoke_handler に登録

### よくある問題と対処

- **clippy: dead_code (`AGENT_STATUS_VALUES`)**: もし参照されていなければ `#[allow(dead_code)]` を一時的に付けるか、テストで参照することで解消
- **clippy: needless_borrow / format!**: clippy 提案通りに修正 (3 行以下なら本チケット内)
- **テストの順序依存**: `:memory:` DB を使うので問題ないはずだが、time-based テストで `sleep(10ms)` が短いと flaky になる場合は `sleep(20ms)` に増やしてもよい

### 不合格条件 (= 別チケット化)

- 4 行以上のリファクタが必要な clippy warning
- 既存テスト 1 件以上が新規変更で fail する (回帰)
- ビルド失敗
- 上記いずれかが発生したら本チケットを fail とし、対応する修正チケットを Orchestrator が新規に作成する

## Out of scope

- フロントエンド (`pnpm tsc` / `pnpm build`) の検証 (Phase 2B 以降)
- 実 Tauri アプリ起動 (Phase 2D Smoke チケットで実施)
- 新機能の追加
- Phase 1 既存技術的負債の解消 (QTM-009 で対応)
