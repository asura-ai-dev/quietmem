// src/services/projectService.ts
//
// Tauri commands (project_*) を呼び出す invoke ラッパー。
// 出典: agent-docs/tauri-commands.md §invoke ラッパー (TypeScript)

import { invoke } from "@tauri-apps/api/core";
import type {
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
} from "../types/bindings";

const projectService = {
  create: (input: ProjectCreateInput): Promise<Project> =>
    invoke<Project>("project_create", { input }),
  list: (): Promise<Project[]> => invoke<Project[]>("project_list"),
  update: (input: ProjectUpdateInput): Promise<Project> =>
    invoke<Project>("project_update", { input }),
} as const;

export { projectService };
