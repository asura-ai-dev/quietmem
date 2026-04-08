# Task 1D04: ドメインキャッシュ store (projectStore / agentStore)

## Objective

Project / Agent / Worktree を取得・キャッシュするための zustand store を実装する。services 層を呼んで state を更新するアクションを公開する。

## Scope

- `src/store/projectStore.ts`
  - State:
    - `projects: Project[]`
    - `selectedProjectId: string | null`
    - `loading: boolean`
    - `error: string | null`
  - Actions:
    - `refresh(): Promise<void>` : `projectService.list()` を呼び結果を state に反映
    - `create(input: ProjectCreateInput): Promise<Project>` : `projectService.create(input)` → refresh
    - `update(input: ProjectUpdateInput): Promise<Project>` : 同様
    - `selectProject(id: string | null): void`
- `src/store/agentStore.ts`
  - State:
    - `agentsByProject: Record<string, Agent[]>`
    - `worktreesByProject: Record<string, Worktree[]>`
    - `loading: boolean`
    - `error: string | null`
  - Actions:
    - `refreshAgents(projectId: string): Promise<void>`
    - `refreshWorktrees(projectId: string): Promise<void>`
    - `createAgent(input: AgentCreateInput): Promise<Agent>`
    - `updateAgent(input: AgentUpdateInput): Promise<Agent>`
    - `createWorktree(input: WorktreeCreateInput): Promise<Worktree>`
    - `updateWorktree(input: WorktreeUpdateInput): Promise<Worktree>`

## Implementation Notes

- 参照: `agent-docs/ui-shell.md`, `agent-docs/architecture.md`
- store 内で services 層を呼び出す。components からは store のアクションのみ使う
- エラーは `AppErrorPayload` 形式で catch し `error` state にメッセージを入れる
- Phase 1 ではシンプルな楽観更新は行わず、すべて create → refresh のパターンで良い
- `agentsByProject[projectId]` の初期化は空配列

## Depends On

- task-1D02
- task-1D03
