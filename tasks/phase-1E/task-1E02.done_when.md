# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/shell/Header.tsx` が存在し `QuietMem` 文字列を含む
- Header に Dashboard / Settings ボタンがあり、`useUiStore.setRoute` を呼び出す
- `src/shell/LeftSidebar.tsx` が存在し `projectStore.projects` を参照
- `src/shell/RightPanel.tsx` が存在し、3 セクション (task input, latest interactions, memory context preview) を含む
- RightPanel がチャット UI でないこと (inputs をループする構造になっていないこと)
- デザイントークン (`--accent-primary`, `--accent-attention`) が少なくとも 2 箇所で参照される
- `WorkspaceRoute.tsx` が各コンポーネントをマウントする
- `pnpm tsc --noEmit` / `pnpm build` がエラーなし
