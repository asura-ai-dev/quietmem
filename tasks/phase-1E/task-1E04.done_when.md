# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/shell/BottomDrawer.tsx` が存在
- 4 タブ (diff, logs, problems, output) のボタンがある
- トグルボタンが `aria-expanded` を持ち、`useUiStore.toggleDrawer` を呼ぶ
- `drawerOpen` が true のとき展開領域がレンダリングされる
- `drawerTab` が変わると表示が切り替わる
- `WorkspaceRoute` の grid 最終行が `drawerOpen` に応じて 32px / 272px (または近い値) に切り替わる
- `pnpm tsc --noEmit` / `pnpm build` がエラーなし
