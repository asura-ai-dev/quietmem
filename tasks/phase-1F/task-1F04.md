# Task 1F04: AgentEditForm で active_worktree_id を設定可能にする

## Objective

Agent 編集フォームを実装し、`activeWorktreeId` を Worktree 一覧から選択して更新できるようにする。保存後に再取得しても値が保持されることを確認できる状態にする。

## Scope

- `src/features/agents/AgentEditForm.tsx`
  - props: `agent: Agent`, `worktrees: Worktree[]`
  - 編集可能フィールド: `name`, `role`, `adapterType`, `status`, `activeWorktreeId`
  - `activeWorktreeId` は `<select>` で `worktrees` 一覧から選択 (空白選択肢で null)
  - submit で `agentStore.updateAgent({ id: agent.id, ... })`
  - 保存成功後に `refreshAgents(agent.projectId)` を呼ぶ
- `src/tabs/OverviewTab.tsx`
  - `selectedAgentId` がある場合に `AgentEditForm` を表示
  - `agent = agentsByProject[projectId].find(a => a.id === selectedAgentId)`
  - AgentList の各行に「編集」ボタンを追加し `setSelectedAgentId` を呼ぶ

## Implementation Notes

- 参照: `agent-docs/ui-shell.md`, `agent-docs/tauri-commands.md`
- `<select>` の value が空文字のとき `activeWorktreeId: null` を送る
- Worktree が 0 件のときは `activeWorktreeId` セレクタを disabled にし、ヒントメッセージを出す
- AgentList 側で現在の `activeWorktreeId` を Worktree の `branchName` に解決して表示できるとわかりやすい (`worktreesByProject[projectId]` から lookup)

## Depends On

- task-1F03
