# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
```

## チェック項目

- `package.json` の dependencies に `zustand` がある
- `src/store/uiStore.ts` が存在
- `Route`, `MainTabKey`, `DrawerTabKey` 型が export されている
- `useUiStore` (または同等のフック) が zustand `create` で作られている
- State と Actions の全項目 (`setRoute`, `setActiveTab`, `toggleDrawer`, `setDrawerOpen`, `setDrawerTab`) が存在
- 初期値が spec に従っている (`activeTab = "overview"`, `drawerOpen = false` 等)
- `pnpm tsc --noEmit` がエラーなし
