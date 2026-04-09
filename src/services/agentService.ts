// src/services/agentService.ts
//
// Tauri commands (agent_*) を呼び出す invoke ラッパー。
// 出典: agent-docs/tauri-commands.md §invoke ラッパー (TypeScript)
//
// 注意: agent_list_by_project は引数 1 つのため `{ projectId }` をフラットに渡す。

import type {
  Agent,
  AgentCreateInput,
  AgentDuplicateInput,
  AgentUpdateInput,
} from "../types/bindings";
import { safeInvoke } from "./tauri";

const agentService = {
  create: (input: AgentCreateInput): Promise<Agent> =>
    safeInvoke<Agent>("agent_create", { input }),
  listByProject: (projectId: string): Promise<Agent[]> =>
    safeInvoke<Agent[]>("agent_list_by_project", { projectId }),
  update: (input: AgentUpdateInput): Promise<Agent> =>
    safeInvoke<Agent>("agent_update", { input }),
  duplicate: (input: AgentDuplicateInput): Promise<Agent> =>
    safeInvoke<Agent>("agent_duplicate", { input }),
} as const;

export { agentService };
