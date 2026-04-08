# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/routes/FirstRunRoute.tsx`, `DashboardRoute.tsx`, `SettingsRoute.tsx` が存在
- `App.tsx` が `useUiStore.route` に応じて 4 画面を切り替える
- `App.tsx` がマウント時に `projectStore.refresh()` を呼ぶ
- `projects.length === 0` 時に `setRoute("firstRun")` が呼ばれるロジックがある
- Dashboard / Settings 画面に `ワークスペースに戻る` 相当のボタンがある
- FirstRunRoute に Project 作成のためのフォームプレースホルダがある
- `pnpm tsc --noEmit` / `pnpm build` がエラーなし
