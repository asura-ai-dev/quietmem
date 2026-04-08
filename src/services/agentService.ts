// src/services/agentService.ts
//
// Tauri commands (agent_*) を呼び出す invoke ラッパー。
// 出典: agent-docs/tauri-commands.md §invoke ラッパー (TypeScript)
//
// 注意: agent_list_by_project は引数 1 つのため `{ projectId }` をフラットに渡す。

import { invoke } from "@tauri-apps/api/core";
import type {
  Agent,
  AgentCreateInput,
  AgentUpdateInput,
} from "../types/bindings";

const agentService = {
  create: (input: AgentCreateInput): Promise<Agent> =>
    invoke<Agent>("agent_create", { input }),
  listByProject: (projectId: string): Promise<Agent[]> =>
    invoke<Agent[]>("agent_list_by_project", { projectId }),
  update: (input: AgentUpdateInput): Promise<Agent> =>
    invoke<Agent>("agent_update", { input }),
} as const;

export { agentService };
