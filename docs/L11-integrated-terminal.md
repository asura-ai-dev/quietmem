# L11 Integrated Terminal

## Objective

QuietMem 内で active worktree を起点に手動コマンドを実行できる統合ターミナル要件を定義する。

## Scope

- 統合ターミナル
- PTY セッション管理
- worktree 連動
- 外部 IDE / OS ファイルマネージャ連携
- terminal 履歴 / 表示
- CLI agent 実行基盤との責務分離

## Requirements

### 1. Terminal Access

- ユーザーは workspace 内から統合ターミナルを開ける
- terminal は current project と active worktree を前提に開く
- active worktree 未設定時は project root を起点に開ける
- terminal を閉じても再度開ける

### 2. Interactive PTY

- terminal は対話型 PTY として動作する
- `stdin` / `stdout` / `stderr` を扱える
- 長時間実行プロセスを表示し続けられる
- `claude code` や `codex` を含む通常の対話型 CLI を扱える

### 3. Terminal Sessions

- 複数 terminal タブを持てる
- terminal セッションごとに title または対象 worktree を識別できる
- agent / worktree ごとに terminal セッションを分離できる
- 同一 project 内で parallel terminals を常時併用できる
- terminal を切り替えても他セッションは維持される

### 4. Workspace Alignment

- terminal のカレントディレクトリは active worktree に追従できる
- ユーザーは必要に応じて別 worktree 用 terminal を開ける
- file tree / editor / diff と同じ作業場の文脈を共有できる

### 5. Supported Manual Commands

- ユーザーは `git`、`claude code`、`codex`、`pnpm`、`npm`、`cargo`、`pytest` 等の手動コマンドを実行できる
- 統合ターミナルは特定 adapter 専用にしない
- アプリは手動コマンドの内容を過度に制限しない

### 6. External IDE Interop

- ユーザーは current project または active worktree を外部アプリで開ける
- MVP では `Open in VS Code`、`Open in Cursor`、`Open in Terminal`、`Open in File Manager` 相当の導線を提供する
- Open 操作は対象 worktree / project root を明示して行う
- 外部 IDE で開いたあとも QuietMem 側の worktree / diff / terminal 文脈は維持される

### 7. Separation From Run Execution

- 統合ターミナルはユーザー主導の任意操作である
- CLI adapter による run 実行はアプリ主導の定型操作である
- terminal は run 管理の代替ではない
- run 実行と terminal は同一 workspace 内で共存できる

### 8. MVP UI Scope

- MVP では terminal を workspace の下部パネルまたは同等に常時アクセス可能な位置へ置く
- 複数 terminal タブを開ける
- セッション作成、表示、入力、終了ができる
- terminal 出力をスクロールして確認できる
- worktree 単位で `Open in IDE` 導線を提供する

## Acceptance Criteria

- ユーザーは active worktree を起点に統合ターミナルを開ける
- ユーザーは `git` や CLI coding agent を手動実行できる
- 複数 terminal セッションを切り替えて保持できる
- ユーザーは current worktree を外部 IDE や OS 標準ファイルマネージャ / Terminal で開ける
- CLI adapter による run と terminal の責務差が明確である

## Non-Goals

- VSCode 相当の完全なターミナルワークスペース再現
- SSH / Docker / remote container の完全対応
- 高度なシェル補完やシェル設定同期
- GUI からの複雑な Git 操作自動化
