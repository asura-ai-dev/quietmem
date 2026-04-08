# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/features/projects/ProjectList.tsx` が存在し、`projectStore.projects` を表示
- `src/features/projects/ProjectCreateForm.tsx` が存在し、`name`, `slug`, `rootPath` の 3 入力を持つ
- フォーム submit で `projectStore.create` を呼び出す
- `FirstRunRoute` が `ProjectCreateForm` を表示し、`onCreated` で `setRoute("workspace")` を呼ぶ
- `OverviewTab` で `ProjectList` + `ProjectCreateForm` がレンダリングされる
- 選択中 project が視覚的に区別される
- `pnpm tsc --noEmit` / `pnpm build` がエラーなし
