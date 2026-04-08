# UI Shell 設計

## 概要

Workspace Shell のコンポーネント階層、ペイン構成、タブ構成、ルーティング戦略、デザイントークンを定義する。L04 の 1 画面中心方針を反映し、5 領域 (Header / LeftSidebar / MainTabs / RightPanel / BottomDrawer) を常時表示する。

## 仕様からの対応

- spec.md §4.4 Workspace Shell
- spec.md §4.5 別画面方針
- spec.md §4.6 デザイントークン
- spec.md §4.7 Project / Agent / Worktree の最低限 UI
- spec.md §5.2 受け入れ条件 (UI 部)
- L04-workspace-ux.md 全体

## ルーティング戦略

Phase 1 では軽量なパターンとして以下を採用する。

- `react-router-dom` は使わず、`uiStore` (zustand) で `route: "firstRun" | "workspace" | "dashboard" | "settings"` を管理する
- `App.tsx` が `uiStore.route` に応じて 1 つのトップ画面をレンダリング
- 初期化時のロジック
  1. `projectService.list()` を呼ぶ
  2. 結果が空なら `route = "firstRun"`
  3. 結果が 1 件以上なら `route = "workspace"`
- Header のメニューから Dashboard / Settings へ `setRoute()` で遷移
- 各別画面は「戻る」ボタンで `route = "workspace"` にする

この選択の理由は `tech-stack.md` を参照。

## コンポーネント階層

```
<App>
  ├─ <FirstRunRoute>            (route === "firstRun")
  │    └─ <ProjectCreateForm variant="firstRun" />
  ├─ <WorkspaceRoute>           (route === "workspace")
  │    ├─ <Header>
  │    ├─ <ShellBody>
  │    │   ├─ <LeftSidebar>
  │    │   │    ├─ <ProjectNavSection>
  │    │   │    └─ <AgentNavSection>
  │    │   ├─ <MainTabs>
  │    │   │    ├─ <TabBar tabs=[overview, editor, memory, runs, cron]/>
  │    │   │    └─ <TabContent>
  │    │   │         ├─ <OverviewTab>   (Project/Agent/Worktree 一覧+フォーム)
  │    │   │         ├─ <EditorTab/>    (プレースホルダ)
  │    │   │         ├─ <MemoryTab/>
  │    │   │         ├─ <RunsTab/>
  │    │   │         └─ <CronTab/>
  │    │   └─ <RightPanel>
  │    │        ├─ <TaskInputSection/>
  │    │        ├─ <LatestInteractionsSection/>
  │    │        └─ <MemoryContextPreviewSection/>
  │    └─ <BottomDrawer open={drawerOpen}>
  │         ├─ <DrawerTabBar tabs=[diff, logs, problems, output]/>
  │         └─ <DrawerContent/>
  ├─ <DashboardRoute>           (route === "dashboard")
  └─ <SettingsRoute>            (route === "settings")
```

## レイアウト (CSS Grid)

`WorkspaceRoute` のルート要素は以下の grid。

```
grid-template-columns: 240px 1fr 320px;
grid-template-rows: 48px 1fr auto;
grid-template-areas:
  "header header header"
  "left   main   right"
  "drawer drawer drawer";
```

- `Header` : `grid-area: header`
- `LeftSidebar` : `grid-area: left`
- `MainTabs` : `grid-area: main`
- `RightPanel` : `grid-area: right`
- `BottomDrawer` : `grid-area: drawer`, 閉じている時は高さ 32px (タブバーのみ)、開いている時は 240px

## MainTabs 仕様

- タブ配列: `["overview", "editor", "memory", "runs", "cron"]`
- 現在タブは `uiStore.activeTab` で管理
- タブ切替は中身の実 DOM を差し替える (CSS `display:none` での隠蔽ではなく、マウント切替)
- Phase 1 の中身
  - `overview`: Project / Agent / Worktree の実 UI (後述)
  - それ以外: `<Placeholder label="Editor" hint="QTM-004 で実装予定" />` のような静的プレースホルダ

## Overview タブ内構成

```
<OverviewTab>
  <Section title="Project">
    <ProjectList />
    <ProjectCreateForm />
  </Section>
  <Section title="Agents" disabled={!selectedProjectId}>
    <AgentList projectId={selectedProjectId} />
    <AgentCreateForm projectId={selectedProjectId} />
    <AgentEditForm agent={selectedAgent} worktrees={worktrees} />
  </Section>
  <Section title="Worktrees" disabled={!selectedProjectId}>
    <WorktreeList projectId={selectedProjectId} />
    <WorktreeCreateForm projectId={selectedProjectId} />
  </Section>
</OverviewTab>
```

- `selectedProjectId` は `projectStore` が保持
- Agent の編集フォームには Worktree セレクタがあり、`activeWorktreeId` を更新可能
- LeftSidebar の Project クリックでも `selectedProjectId` が更新される

## RightPanel (Interaction Panel)

チャット UI ではない。以下 3 セクションを上から積む。

1. `TaskInputSection`
   - 複数行テキストエリア + `Run` ボタン (Phase 1 は disabled)
   - ラベル: 「次のタスク」
2. `LatestInteractionsSection`
   - 見出し + 空状態表示 (`まだ実行がありません` 等)
3. `MemoryContextPreviewSection`
   - 見出し + 空状態表示 (`参照中の memory はありません`)

各セクションは `<aside>` + `<header>` + `<div>` のシンプルな構造。Phase 1 では機能せず、レイアウトのみ。

## BottomDrawer

- 状態: `drawerOpen: boolean`, `drawerTab: "diff"|"logs"|"problems"|"output"`
- 常にタブバー (32px) が見える
- タブバー右端に `▲ / ▼` トグルボタン
- 開閉は CSS transition で `grid-template-rows` の最終行高さを切り替える

## 別画面 (Dashboard / Settings / FirstRun)

### FirstRunRoute

- 中央寄せのカード + 「最初の Project を作成する」フォーム
- 送信成功で `setRoute("workspace")`
- 仕様: Project が 0 件のときに自動遷移

### DashboardRoute (最小)

- タイトル「Dashboard」
- サブテキスト「後続フェーズで実装します」
- 「ワークスペースに戻る」ボタン

### SettingsRoute (最小)

- タイトル「Settings」
- サブテキスト「後続フェーズで実装します」
- 「ワークスペースに戻る」ボタン

## デザイントークン

`src/styles/tokens.css` に CSS variables として集約する。

```css
:root {
  /* Sage green (primary) */
  --color-sage-50: #f1f5f1;
  --color-sage-200: #c8d8c6;
  --color-sage-400: #8fa98a;
  --color-sage-500: #6f8f6a;
  --color-sage-600: #577555;
  --color-sage-700: #425c40;

  /* Dark gray (surface/text) */
  --color-gray-50: #f4f5f5;
  --color-gray-200: #d4d6d6;
  --color-gray-400: #8a8d8d;
  --color-gray-600: #45494a;
  --color-gray-800: #24272a;
  --color-gray-900: #15181a;

  /* Amber (accent) */
  --color-amber-300: #f0c46b;
  --color-amber-500: #d99a2b;
  --color-amber-700: #a06d12;

  /* Semantic aliases */
  --bg-app: var(--color-gray-900);
  --bg-surface: var(--color-gray-800);
  --bg-surface-2: var(--color-gray-600);
  --fg-primary: var(--color-gray-50);
  --fg-muted: var(--color-gray-400);
  --accent-primary: var(--color-sage-500);
  --accent-primary-hover: var(--color-sage-400);
  --accent-attention: var(--color-amber-500);
  --border-subtle: var(--color-gray-600);

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
  --font-mono: "SF Mono", Menlo, monospace;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
}
```

- 各コンポーネントは raw 色値を使わず、セマンティックエイリアス (`--bg-surface` 等) を参照する
- Phase 1 では dark テーマ 1 種類のみ。`prefers-color-scheme` 対応は後続

## アクセシビリティ (最低ライン)

- タブは `role="tablist"` / `role="tab"` / `role="tabpanel"` + `aria-selected`
- タブ移動に ←/→ キー対応
- BottomDrawer 開閉は `button` 要素 + `aria-expanded`
- フォーム要素は `label` を関連付け

## 制約・注意事項

- コンポーネントは presentational を心掛け、直接 invoke しない。データ取得は services 層経由
- `uiStore` はグローバル UI 状態 (route / activeTab / drawerOpen / drawerTab) のみを持つ
- `projectStore` / `agentStore` はドメインデータのキャッシュを持つ
- Phase 1 では絶対位置レイアウトを使わない (リサイズ対応のため grid/flex のみ)
- アイコンライブラリは Phase 1 では導入しない (文字・CSS のみで表現)
