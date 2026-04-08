# Task 1F03: Worktree 一覧と作成フォームの実装

## Objective

選択中 Project 配下の Worktree 一覧と作成フォームを実装し、`worktreeService` 経由で接続する。

## Scope

- `src/features/worktrees/WorktreeList.tsx`
  - props: `projectId: string`
  - マウント時に `agentStore.refreshWorktrees(projectId)` を呼ぶ
  - `worktreesByProject[projectId]` を `<ul>` で表示 (branch_name / path / base_branch / status / agent_id)
- `src/features/worktrees/WorktreeCreateForm.tsx`
  - props: `projectId: string`
  - フィールド: `branchName`, `path`, `baseBranch` (default `"main"`), `status` (default `"ready"`)
  - submit で `agentStore.createWorktree({ projectId, ... })`
- `src/tabs/OverviewTab.tsx`
  - `<Section title="Worktrees">` 内で `WorktreeList` + `WorktreeCreateForm` を表示

## Implementation Notes

- 参照: `agent-docs/ui-shell.md`, `agent-docs/tauri-commands.md`
- `agentId` はこの画面では設定しない (1F04 の AgentEditForm 側で紐付ける)
- フォーム送信後に `refreshWorktrees(projectId)` が再度呼ばれるよう `agentStore.createWorktree` 内で処理する (1D04 で実装済み)

## Depends On

- task-1F02
