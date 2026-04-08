# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
```

## チェック項目

- `src/services/projectService.ts` が存在し `create`, `list`, `update` を export
- `src/services/agentService.ts` が存在し `create`, `listByProject`, `update` を export
- `src/services/worktreeService.ts` が存在し `create`, `listByProject`, `update` を export
- 各関数の戻り値が `bindings.ts` の型と整合する `Promise<T>` である
- `@tauri-apps/api/core` の `invoke` を使っている
- `pnpm tsc --noEmit` がエラーなし
