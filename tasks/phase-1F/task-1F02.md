# Task 1F02: Agent 一覧と作成フォームの実装

## Objective

選択中 Project 配下の Agent 一覧と作成フォームを実装し、`agentService` 経由で接続する。

## Scope

- `src/features/agents/AgentList.tsx`
  - props: `projectId: string`
  - マウント時 (および projectId 変更時) に `agentStore.refreshAgents(projectId)` を呼ぶ
  - `agentsByProject[projectId]` を `<ul>` で表示 (name / role / adapterType / status / activeWorktreeId)
  - 選択中 agent の概念 (activeAgentId) を `agentStore` に追加するか、ローカル state で持つかは実装者判断。Phase 1 は 1F04 の編集フォームに繋がれば良いので、List 側で選択状態を持つ
- `src/features/agents/AgentCreateForm.tsx`
  - props: `projectId: string`
  - フィールド: `name`, `role`, `adapterType`, `promptPath` (optional), `configPath` (optional), `status` (optional, default `idle`)
  - submit で `agentStore.createAgent({ projectId, ... })`
  - 成功後にフォームリセット
- `src/tabs/OverviewTab.tsx`
  - `<Section title="Agents">` 内で選択中 projectId がある場合のみ `AgentList` + `AgentCreateForm` を表示
  - 未選択時は `Project を選択してください` を表示

## Implementation Notes

- 参照: `agent-docs/ui-shell.md`, `agent-docs/tauri-commands.md`
- `adapterType` のデフォルトは `"cli"` (後続で enum 化)
- `status` のデフォルトは `"idle"`
- フォームは単純 useState
- 選択中 agent の管理は 1F04 で使うため、OverviewTab レベルで `const [selectedAgentId, setSelectedAgentId] = useState<string|null>(null)` を持つ

## Depends On

- task-1F01
