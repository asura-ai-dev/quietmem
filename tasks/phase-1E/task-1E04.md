# Task 1E04: BottomDrawer (開閉 + 4 タブ)

## Objective

BottomDrawer を実装する。常にタブバーが見えて、開閉ボタンで内容が展開される。内容は 4 タブ (diff / logs / problems / output) のプレースホルダ。

## Scope

- `src/shell/BottomDrawer.tsx`
  - タブバー: `diff`, `logs`, `problems`, `output` の 4 ボタン
  - 右端に開閉トグルボタン (`▲` / `▼`)
  - 開閉状態は `useUiStore.drawerOpen`
  - 現在タブは `useUiStore.drawerTab`
  - タブクリックで `setDrawerTab`
  - トグルで `toggleDrawer`
  - 開いているときのみ `<DrawerContent>` をレンダリング
  - 各 DrawerContent は `<div>{tabKey} (placeholder)</div>` で良い
- `BottomDrawer.module.css`
  - タブバー 32px + 開いているとき展開領域 240px
  - CSS transition で高さを変化させる (過度な演出は不要、`transition: grid-template-rows 160ms ease`)
- `WorkspaceRoute.tsx` の grid 最終行を `drawerOpen` に応じて `32px` / `272px` に切り替える
  - 実装: WorkspaceRoute 側で `useUiStore.drawerOpen` を読み、style inline で grid-template-rows を切り替える

## Implementation Notes

- 参照: `agent-docs/ui-shell.md` (BottomDrawer セクション)
- トグルボタンは `aria-expanded={drawerOpen}`
- キーボード操作対応 (Tab / Enter / Space) は HTML button のデフォルトで OK
- `BottomDrawer` は `grid-area: drawer` を持つ

## Depends On

- task-1E03
