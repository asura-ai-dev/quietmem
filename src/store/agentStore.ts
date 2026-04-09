// src/store/agentStore.ts
//
// Agent / Worktree ドメインキャッシュ store。
// agentService / worktreeService を呼び出し、project ごとの一覧をキャッシュする。
//
// 参照: agent-docs/ui-shell.md, agent-docs/architecture.md, tasks/phase-1D/task-1D04.md
//
// 設計方針:
// - agents / worktrees の両方をこの store で管理する (チケット指定)
// - キャッシュ構造は `Record<projectId, Entity[]>`。初期値は空配列
// - create/update → 対応する refresh(projectId) で一覧更新 (楽観更新なし)
// - AppErrorPayload 形式の例外を catch して error state に詰める

import { create } from "zustand";
import { agentService } from "../services/agentService";
import { worktreeService } from "../services/worktreeService";
import type {
  Agent,
  AgentCreateInput,
  AgentDuplicateInput,
  AgentUpdateInput,
  AppErrorPayload,
  Worktree,
  WorktreeCreateInput,
  WorktreeUpdateInput,
} from "../types/bindings";

const toErrorMessage = (err: unknown): string => {
  if (typeof err === "object" && err !== null) {
    const maybe = err as Partial<AppErrorPayload>;
    if (typeof maybe.message === "string" && typeof maybe.code === "string") {
      return `${maybe.code}: ${maybe.message}`;
    }
  }
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "unknown error";
};

export interface AgentState {
  // State
  agentsByProject: Record<string, Agent[]>;
  worktreesByProject: Record<string, Worktree[]>;
  loading: boolean;
  error: string | null;

  // Actions (Agents)
  refreshAgents: (projectId: string) => Promise<void>;
  createAgent: (input: AgentCreateInput) => Promise<Agent>;
  updateAgent: (input: AgentUpdateInput) => Promise<Agent>;
  duplicateAgent: (input: AgentDuplicateInput) => Promise<Agent>;

  // Actions (Worktrees)
  refreshWorktrees: (projectId: string) => Promise<void>;
  createWorktree: (input: WorktreeCreateInput) => Promise<Worktree>;
  updateWorktree: (input: WorktreeUpdateInput) => Promise<Worktree>;
}

export const useAgentStore = create<AgentState>()((set, get) => ({
  agentsByProject: {},
  worktreesByProject: {},
  loading: false,
  error: null,

  refreshAgents: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const agents = await agentService.listByProject(projectId);
      set((state) => ({
        agentsByProject: { ...state.agentsByProject, [projectId]: agents },
        loading: false,
      }));
    } catch (err) {
      set({ loading: false, error: toErrorMessage(err) });
    }
  },

  createAgent: async (input) => {
    set({ loading: true, error: null });
    try {
      const agent = await agentService.create(input);
      await get().refreshAgents(input.projectId);
      return agent;
    } catch (err) {
      set({ loading: false, error: toErrorMessage(err) });
      throw err;
    }
  },

  updateAgent: async (input) => {
    set({ loading: true, error: null });
    try {
      const agent = await agentService.update(input);
      // update input は projectId を持たないため、返却された agent の projectId で再取得
      await get().refreshAgents(agent.projectId);
      return agent;
    } catch (err) {
      set({ loading: false, error: toErrorMessage(err) });
      throw err;
    }
  },

  duplicateAgent: async (input) => {
    set({ loading: true, error: null });
    try {
      const agent = await agentService.duplicate(input);
      // 戻り値の projectId で対応 project の一覧を再取得
      await get().refreshAgents(agent.projectId);
      return agent;
    } catch (err) {
      set({ loading: false, error: toErrorMessage(err) });
      throw err;
    }
  },

  refreshWorktrees: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const worktrees = await worktreeService.listByProject(projectId);
      set((state) => ({
        worktreesByProject: {
          ...state.worktreesByProject,
          [projectId]: worktrees,
        },
        loading: false,
      }));
    } catch (err) {
      set({ loading: false, error: toErrorMessage(err) });
    }
  },

  createWorktree: async (input) => {
    set({ loading: true, error: null });
    try {
      const worktree = await worktreeService.create(input);
      await get().refreshWorktrees(input.projectId);
      return worktree;
    } catch (err) {
      set({ loading: false, error: toErrorMessage(err) });
      throw err;
    }
  },

  updateWorktree: async (input) => {
    set({ loading: true, error: null });
    try {
      const worktree = await worktreeService.update(input);
      await get().refreshWorktrees(worktree.projectId);
      return worktree;
    } catch (err) {
      set({ loading: false, error: toErrorMessage(err) });
      throw err;
    }
  },
}));
