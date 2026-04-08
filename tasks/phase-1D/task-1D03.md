# Task 1D03: UI state store (uiStore)

## Objective

zustand で UI のグローバル状態 (route / activeTab / drawerOpen / drawerTab) を管理する store を実装する。

## Scope

- `package.json` に `zustand` を dependencies に追加 (pnpm add zustand)
- `src/store/uiStore.ts`
  - Type:
    - `Route = "firstRun" | "workspace" | "dashboard" | "settings"`
    - `MainTabKey = "overview" | "editor" | "memory" | "runs" | "cron"`
    - `DrawerTabKey = "diff" | "logs" | "problems" | "output"`
  - State:
    - `route: Route`
    - `activeTab: MainTabKey`
    - `drawerOpen: boolean`
    - `drawerTab: DrawerTabKey`
  - Actions:
    - `setRoute(route: Route): void`
    - `setActiveTab(tab: MainTabKey): void`
    - `toggleDrawer(): void`
    - `setDrawerOpen(open: boolean): void`
    - `setDrawerTab(tab: DrawerTabKey): void`
  - 初期値: `route = "workspace"`, `activeTab = "overview"`, `drawerOpen = false`, `drawerTab = "logs"`
  - `create<UiState>()((set) => ({ ... }))` で実装

## Implementation Notes

- 参照: `agent-docs/ui-shell.md`, `agent-docs/tech-stack.md`
- 初期値を `"workspace"` にしておき、`App.tsx` の初期化で `projectService.list()` の結果によって `setRoute("firstRun")` に更新する (1E05 で実装)
- zustand の slice 分割は Phase 1 では不要

## Depends On

- task-1A02
