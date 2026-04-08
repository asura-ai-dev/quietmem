# Task 1F06: OverviewTab / AgentList / WorktreeList の Zustand selector 安定化 + Error Boundary

## Objective

Phase 1F evaluator で検出された重大な回帰を修正する。OverviewTab / AgentList / WorktreeList の 3 ファイルで zustand selector 内に `?? []` で空配列リテラルを書いており、`useSyncExternalStore` の identity 比較で無限ループを発生させ、Workspace 全体が空画面になる。これを修正し、加えて Error Boundary を 1 層追加して将来の例外で全面ブランクを防ぐ。

## Scope

### 1. stable empty array 定数の追加

- `src/features/agents/AgentList.tsx`
  - モジュールトップに `const EMPTY_AGENTS: readonly Agent[] = [];` `const EMPTY_WORKTREES: readonly Worktree[] = [];` を追加
  - selector 内の `state.agentsByProject[projectId] ?? []` → `state.agentsByProject[projectId] ?? EMPTY_AGENTS`
  - selector 内の `state.worktreesByProject[projectId] ?? []` → `... ?? EMPTY_WORKTREES`
- `src/features/worktrees/WorktreeList.tsx`
  - 同様に `const EMPTY_WORKTREES: readonly Worktree[] = [];` を追加し selector で参照
- `src/tabs/OverviewTab.tsx`
  - 同様に 3 つの EMPTY 定数 (`EMPTY_PROJECTS` / `EMPTY_AGENTS` / `EMPTY_WORKTREES`) を追加し selector で参照
  - ただし projectStore は projects が初期化済みなので `EMPTY_PROJECTS` は不要な可能性あり。実コードを確認して必要な箇所のみ

### 2. Error Boundary の追加

- `src/components/ErrorBoundary.tsx` 新規作成
  - React class component (or react-error-boundary 不要なので手書き)
  - props: `children` + 任意の `fallback`
  - componentDidCatch でエラーをログ + fallback を描画
  - デフォルト fallback: "アプリケーションでエラーが発生しました。再起動してください。"
- `src/App.tsx`
  - `<WorkspaceRoute />` を `<ErrorBoundary><WorkspaceRoute /></ErrorBoundary>` でラップ
  - FirstRun / Dashboard / Settings も含めるか? → Workspace 1 箇所で十分 (他は薄い)

## Implementation Notes

- `readonly T[]` 型で declare することで mutation 防止
- `const` は モジュールトップで 1 回だけ評価されるので identity が安定
- selector が返す `Agent[]` と `readonly Agent[]` の型差は `.map()` 等の read 操作には影響しない。List 側で書き換えないこと
- Error Boundary は最小実装で良い。テーマ変数を使った簡単な fallback
- この修正完了後、evaluator を再実行して `?review=1` で Workspace が描画されること + AgentList/WorktreeList が空状態を正しく表示することを確認

## Depends On

- task-1F04
- task-1F05
