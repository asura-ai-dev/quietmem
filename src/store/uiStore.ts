import { create } from "zustand";

/**
 * UI グローバル状態の型定義。
 *
 * 参照: agent-docs/ui-shell.md
 * - ルーティングは react-router を使わず、zustand で `route` を管理する
 * - MainTabs の現在タブは `activeTab`
 * - BottomDrawer の開閉と現在タブは `drawerOpen` / `drawerTab`
 */

export type Route = "firstRun" | "workspace" | "dashboard" | "settings";

export type MainTabKey = "overview" | "editor" | "memory" | "runs" | "cron";

export type DrawerTabKey = "diff" | "logs" | "problems" | "output";

export interface UiState {
  // State
  route: Route;
  activeTab: MainTabKey;
  drawerOpen: boolean;
  drawerTab: DrawerTabKey;
  selectedAgentId: string | null;

  // Actions
  setRoute: (route: Route) => void;
  setActiveTab: (tab: MainTabKey) => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  setDrawerTab: (tab: DrawerTabKey) => void;
  setSelectedAgentId: (id: string | null) => void;
}

/**
 * UI 状態を管理する zustand store。
 *
 * 初期値:
 * - route: "workspace" (App.tsx 側で projectService.list() の結果に応じて
 *   "firstRun" に更新される。task-1E05 で実装予定)
 * - activeTab: "overview"
 * - drawerOpen: false
 * - drawerTab: "logs"
 * - selectedAgentId: null (起動直後は何も選択していない。
 *   Phase 2C で LeftSidebar Agents セクションと OverviewTab の編集フォームから
 *   同一の真実源として参照される)
 */
export const useUiStore = create<UiState>()((set) => ({
  route: "workspace",
  activeTab: "overview",
  drawerOpen: false,
  drawerTab: "logs",
  selectedAgentId: null,

  setRoute: (route) => set({ route }),
  setActiveTab: (activeTab) => set({ activeTab }),
  toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
  setDrawerTab: (drawerTab) => set({ drawerTab }),
  setSelectedAgentId: (selectedAgentId) => set({ selectedAgentId }),
}));
