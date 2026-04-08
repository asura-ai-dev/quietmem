# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/shell/MainTabs.tsx` が存在
- `src/tabs/OverviewTab.tsx`, `EditorTab.tsx`, `MemoryTab.tsx`, `RunsTab.tsx`, `CronTab.tsx` が存在
- MainTabs に 5 タブ (overview, editor, memory, runs, cron) がある
- タブクリックで `useUiStore.setActiveTab` が呼ばれる
- 選択中タブで `aria-selected="true"` が付く
- `activeTab` に応じて対応する Tab コンポーネントが表示される
- 各タブは `role="tabpanel"` を持つ
- `WorkspaceRoute.tsx` の main 領域が `<MainTabs />` を表示する
- `pnpm tsc --noEmit` / `pnpm build` がエラーなし
