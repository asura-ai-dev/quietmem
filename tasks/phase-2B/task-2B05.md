# task-2B05: uiStore に selectedAgentId 昇格 (action 含む)

## Phase

2B

## Depends on

- task-2B01

## Goal

`OverviewTab.tsx` のローカル state である `selectedAgentId` を `uiStore` に昇格させる。LeftSidebar Agents セクションと OverviewTab の編集フォームが同一の真実源を共有できるようにし、Phase 2C での LeftSidebar 統合を準備する。

## Scope

- `src/store/uiStore.ts`

## Implementation Notes

参照: `agent-docs/phase-2-ui-design.md` §6 selectedAgentId の昇格

### UiState インターフェース拡張

```ts
export interface UiState {
  // State
  route: Route;
  activeTab: MainTabKey;
  drawerOpen: boolean;
  drawerTab: DrawerTabKey;
  selectedAgentId: string | null; // ← 追加

  // Actions
  setRoute: (route: Route) => void;
  setActiveTab: (tab: MainTabKey) => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  setDrawerTab: (tab: DrawerTabKey) => void;
  setSelectedAgentId: (id: string | null) => void; // ← 追加
}
```

### useUiStore 実装

```ts
export const useUiStore = create<UiState>()((set) => ({
  route: "workspace",
  activeTab: "overview",
  drawerOpen: false,
  drawerTab: "logs",
  selectedAgentId: null, // ← 追加

  setRoute: (route) => set({ route }),
  setActiveTab: (activeTab) => set({ activeTab }),
  toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
  setDrawerTab: (drawerTab) => set({ drawerTab }),
  setSelectedAgentId: (selectedAgentId) => set({ selectedAgentId }), // ← 追加
}));
```

### 設計判断

- 既存 state (route / activeTab / drawerOpen / drawerTab) には触れない
- selectedAgentId を ui スコープに置く理由: Phase 2C で LeftSidebar / OverviewTab の双方から同じ id を参照する必要があるため
- 初期値は `null` (起動直後は何も選択していない)
- Project 切り替え時のリセットは Phase 2C で OverviewTab の useEffect から呼ぶ (本チケットでは store 側にだけ action を生やす)

### コンパイル確認

- `pnpm tsc --noEmit` が exit 0
- 既存 OverviewTab は本チケットの時点ではローカル state を使い続けている (まだ uiStore に切り替えない)
- task-2C06 で OverviewTab の差し替えを行う

### export 確認

- `useUiStore` の hook 経由で `selectedAgentId` / `setSelectedAgentId` が利用可能であること
- 個別の selector hook (`useSelectedAgentId` 等) は導入しない (zustand 標準パターンを継続)

## Out of scope

- OverviewTab.tsx の差し替え (task-2C06)
- LeftSidebar.tsx の Agents セクション差し替え (task-2C05)
- Project 切り替え時の selectedAgentId リセット連動 (task-2C06)
- 既存 state の変更
