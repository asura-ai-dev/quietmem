// src/services/projectService.ts
//
// Tauri commands (project_*) を呼び出す invoke ラッパー。
// 出典: agent-docs/tauri-commands.md §invoke ラッパー (TypeScript)

import type {
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
} from "../types/bindings";
import { safeInvoke } from "./tauri";

const projectService = {
  create: (input: ProjectCreateInput): Promise<Project> =>
    safeInvoke<Project>("project_create", { input }),
  list: (): Promise<Project[]> => safeInvoke<Project[]>("project_list"),
  update: (input: ProjectUpdateInput): Promise<Project> =>
    safeInvoke<Project>("project_update", { input }),
} as const;

export { projectService };
