# Task 1F01: Project 一覧と作成フォームの実装

## Objective

Project の一覧表示と作成フォームを実装し、`projectService` 経由で Tauri commands と接続する。`FirstRunRoute` のプレースホルダフォームも本実装に差し替える。

## Scope

- `src/features/projects/ProjectList.tsx`
  - `useProjectStore` から `projects` を取得
  - `<ul>` でリスト表示 (name / slug / root_path)
  - 各項目クリックで `selectProject(id)` を呼ぶ
  - 選択中は `--accent-primary` でハイライト
  - 空状態: `Project がありません`
- `src/features/projects/ProjectCreateForm.tsx`
  - `name`, `slug`, `rootPath` の 3 フィールド
  - submit で `projectStore.create({ name, slug, rootPath })` を呼び、成功したらフォームをリセット
  - 失敗時は `error` を赤系 (amber ではなく `#c46a6a` 等) で表示
  - props: `onCreated?: (project: Project) => void`
- `src/tabs/OverviewTab.tsx`
  - `<Section title="Project">` の中で `ProjectList` + `ProjectCreateForm` を配置
- `src/routes/FirstRunRoute.tsx`
  - プレースホルダフォームを `ProjectCreateForm` に差し替え
  - `onCreated` で `setRoute("workspace")` を呼ぶ
- `src/shell/LeftSidebar.tsx`
  - 既に `projectStore.projects` を参照していれば、click で selectProject するよう確認

## Implementation Notes

- 参照: `agent-docs/ui-shell.md`, `agent-docs/tauri-commands.md`
- フォームは自前 useState で十分 (`react-hook-form` 不使用)
- slug は英数 + `-` / `_` のみのヒント表示
- バリデーションエラー (空欄) はフロントで先に検出
- `create` 成功後に自動で `refresh()` が呼ばれる前提 (1D04 で実装済み)

## Depends On

- task-1E05
