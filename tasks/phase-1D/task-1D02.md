# Task 1D02: services 層 (invoke ラッパー)

## Objective

Tauri commands を呼び出す invoke ラッパーを `src/services/` に配置し、UI コンポーネントから使いやすい形で公開する。

## Scope

- `src/services/projectService.ts`
  - `projectService` オブジェクトに `create`, `list`, `update` を公開
  - 各関数は `invoke<型>("<command_name>", { input })` または引数フラット渡し
- `src/services/agentService.ts`
  - `agentService.create`, `listByProject`, `update`
  - `listByProject(projectId: string)` は `invoke("agent_list_by_project", { projectId })` の形
- `src/services/worktreeService.ts`
  - `worktreeService.create`, `listByProject`, `update`
- `@tauri-apps/api/core` から `invoke` をインポート

## Implementation Notes

- 参照: `agent-docs/tauri-commands.md` (invoke ラッパー例)
- Tauri v2 では `import { invoke } from "@tauri-apps/api/core"` を使う
- 型は `src/types/bindings.ts` から import
- 各サービスは `const projectService = { ... } as const; export { projectService };` の形式で export

## Depends On

- task-1D01
