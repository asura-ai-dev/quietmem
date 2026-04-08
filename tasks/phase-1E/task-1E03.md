# Task 1E03: MainTabs と 5 つのタブコンテンツ

## Objective

Overview / Editor / Memory / Runs / Cron の 5 タブを切り替える `MainTabs` を実装し、`uiStore.activeTab` と連動させる。各タブの中身は最小プレースホルダで良い (Overview も 1F まではプレースホルダ)。

## Scope

- `src/shell/MainTabs.tsx`
  - TabBar: 5 つの button、`aria-selected` を `activeTab === key` に応じて切替
  - タブクリックで `useUiStore.setActiveTab(key)`
  - キーボード ← / → でタブ移動
  - TabContent: `activeTab` に応じて対応するコンポーネントを表示
- `src/tabs/OverviewTab.tsx` : プレースホルダ (1F01〜 で中身を追加)
- `src/tabs/EditorTab.tsx` : `Editor (QTM-004 で実装予定)` のプレースホルダ
- `src/tabs/MemoryTab.tsx` : `Memory (QTM-005 で実装予定)` プレースホルダ
- `src/tabs/RunsTab.tsx` : `Runs (QTM-006 で実装予定)` プレースホルダ
- `src/tabs/CronTab.tsx` : `Cron (QTM-008 で実装予定)` プレースホルダ
- `WorkspaceRoute.tsx` の main 領域に `<MainTabs />` を配置
- `MainTabs.module.css` でタブバーと選択状態のスタイル

## Implementation Notes

- 参照: `agent-docs/ui-shell.md` (MainTabs セクション)
- タブ配列は `const TABS: { key: MainTabKey; label: string }[] = [...]` で定数化
- 各タブコンポーネントは CSS Modules を必須としない (単純な div で良い)
- `role="tablist"`, `role="tab"`, `role="tabpanel"` を付けて a11y の最低ラインを満たす
- 選択中タブは `--accent-primary` の下線または背景

## Depends On

- task-1E02
