# Task 1E05: ルーティング分岐と別画面 (FirstRun / Dashboard / Settings)

## Objective

`App.tsx` で `uiStore.route` に応じて 4 つの画面を切り替える。FirstRun は Project が 0 件のとき、Dashboard / Settings は Header のリンクから到達する。

## Scope

- `src/routes/FirstRunRoute.tsx`
  - 中央寄せカード
  - タイトル `QuietMem へようこそ`
  - 最初の Project を作るためのフォーム (name / slug / root_path) プレースホルダ
  - 1F01 でフォーム実装を差し替える想定で、この時点では `<ProjectCreateForm onCreated={() => setRoute("workspace")} />` をモック (まだ 1F01 前なので仮の `<form>` を書いて成功時 `setRoute("workspace")` を呼ぶ)
- `src/routes/DashboardRoute.tsx`
  - タイトル `Dashboard`
  - サブテキスト `後続フェーズで実装します`
  - 「ワークスペースに戻る」ボタン → `setRoute("workspace")`
- `src/routes/SettingsRoute.tsx`
  - タイトル `Settings`
  - サブテキスト `後続フェーズで実装します`
  - 「ワークスペースに戻る」ボタン → `setRoute("workspace")`
- `src/App.tsx`
  - マウント時に `projectStore.refresh()` を 1 度呼ぶ
  - その後 `projects.length === 0 && route === "workspace"` なら `setRoute("firstRun")`
  - `route` の値に応じて `<FirstRunRoute>` / `<WorkspaceRoute>` / `<DashboardRoute>` / `<SettingsRoute>` を切り替えて表示

## Implementation Notes

- 参照: `agent-docs/ui-shell.md` (ルーティング戦略)
- `App.tsx` の初期化は `useEffect(() => { projectStore.refresh(); }, [])`
- FirstRun のフォームは 1F01 で本物に差し替えるため、この段階では「名前だけ入れて提出すると仮に setRoute する」レベルで良い
- Dashboard / Settings のカードは CSS Modules で 1 画面の中央寄せを実装

## Depends On

- task-1E04
- task-1D04
