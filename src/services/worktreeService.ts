// src/services/worktreeService.ts
//
// Tauri commands (worktree_*) を呼び出す invoke ラッパー。
// 出典: agent-docs/tauri-commands.md §invoke ラッパー (TypeScript)
//
// 注意: worktree_list_by_project は引数 1 つのため `{ projectId }` をフラットに渡す。

import type {
  WorktreeTreeSource,
  Worktree,
  WorktreeCreateInput,
  WorktreeUpdateInput,
} from "../types/bindings";
import { safeInvoke } from "./tauri";

const worktreeService = {
  create: (input: WorktreeCreateInput): Promise<Worktree> =>
    safeInvoke<Worktree>("worktree_create", { input }),
  listByProject: (projectId: string): Promise<Worktree[]> =>
    safeInvoke<Worktree[]>("worktree_list_by_project", { projectId }),
  getFileTree: (worktreeId: string): Promise<WorktreeTreeSource> =>
    safeInvoke<WorktreeTreeSource>("worktree_get_file_tree", { worktreeId }),
  update: (input: WorktreeUpdateInput): Promise<Worktree> =>
    safeInvoke<Worktree>("worktree_update", { input }),
} as const;

export { worktreeService };
