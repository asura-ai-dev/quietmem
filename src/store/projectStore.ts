// src/store/projectStore.ts
//
// Project ドメインキャッシュ store。
// services/projectService.ts を呼び出し、Project 一覧と選択状態を保持する。
//
// 参照: agent-docs/ui-shell.md, agent-docs/architecture.md, tasks/phase-1D/task-1D04.md
//
// 設計方針:
// - components からは store の actions のみを利用する (services 層を直接呼ばせない)
// - Phase 1 では楽観更新せず、create/update の後に refresh を再呼び出しする単純パターン
// - 例外は AppErrorPayload 形式で catch し `error` state にメッセージを格納する

import { create } from "zustand";
import { projectService } from "../services/projectService";
import type {
  AppErrorPayload,
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
} from "../types/bindings";

/**
 * Tauri invoke が reject する際に渡される値を AppErrorPayload とみなして
 * 表示用メッセージに整形する。想定外の shape (string, Error 等) にもフォールバック。
 */
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

export interface ProjectState {
  // State
  projects: Project[];
  selectedProjectId: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  create: (input: ProjectCreateInput) => Promise<Project>;
  update: (input: ProjectUpdateInput) => Promise<Project>;
  selectProject: (id: string | null) => void;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projects: [],
  selectedProjectId: null,
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await projectService.list();
      set((state) => {
        const hasCurrentSelection =
          state.selectedProjectId !== null &&
          projects.some((project) => project.id === state.selectedProjectId);

        return {
          projects,
          selectedProjectId: hasCurrentSelection
            ? state.selectedProjectId
            : (projects[0]?.id ?? null),
          loading: false,
        };
      });
    } catch (err) {
      set({ loading: false, error: toErrorMessage(err) });
    }
  },

  create: async (input) => {
    set({ loading: true, error: null });
    try {
      const project = await projectService.create(input);
      // Phase 1 はシンプル化: 作成後に一覧を再取得する
      await get().refresh();
      return project;
    } catch (err) {
      set({ loading: false, error: toErrorMessage(err) });
      throw err;
    }
  },

  update: async (input) => {
    set({ loading: true, error: null });
    try {
      const project = await projectService.update(input);
      await get().refresh();
      return project;
    } catch (err) {
      set({ loading: false, error: toErrorMessage(err) });
      throw err;
    }
  },

  selectProject: (id) => set({ selectedProjectId: id }),
}));
