# Task 1E01: WorkspaceRoute と 5 領域 Grid レイアウト

## Objective

`WorkspaceRoute` を作り、`Header` / `LeftSidebar` / `MainTabs` / `RightPanel` / `BottomDrawer` の 5 領域を CSS Grid で配置する骨格を用意する。中身はすべて placeholder で良い。

## Scope

- `src/routes/WorkspaceRoute.tsx`
  - CSS Grid ルート要素
  - grid-template: `ui-shell.md` の定義通り
  - 5 つのスロットに placeholder `<header>`, `<aside>`, `<main>`, `<aside>`, `<footer>` を配置
  - 各スロットに背景色 (`--bg-surface`) と border を当てて見た目で区別できるようにする
- `src/routes/WorkspaceRoute.module.css` (CSS Modules)
  - `.root` : Grid 設定
  - `.header`, `.left`, `.main`, `.right`, `.drawer` の `grid-area` 割り当て
- `src/App.tsx`
  - `<WorkspaceRoute />` を直接レンダリング (ルーティング分岐は 1E05 で追加)

## Implementation Notes

- 参照: `agent-docs/ui-shell.md` (レイアウトセクション)
- この時点では `Header` / `LeftSidebar` など専用コンポーネントは不要。インライン `<header className={styles.header}>Header</header>` で十分
- CSS Modules は Vite 標準サポート。ファイル名 `.module.css` で有効化
- tokens.css の変数を直接参照する (`background: var(--bg-surface)`)
- grid の最終行 (drawer) は初期状態で `32px` 固定で良い

## Depends On

- task-1D05
