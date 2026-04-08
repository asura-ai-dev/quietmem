# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

ブラウザ/agent-browser:

```bash
pnpm dev --port 3099 --strictPort &
sleep 5
agent-browser run --url "http://localhost:3099/?review=1" --screenshot /tmp/verify-phase-1F06-workspace.png
```

## チェック項目

- `src/features/agents/AgentList.tsx` のモジュールトップに `EMPTY_AGENTS` および `EMPTY_WORKTREES` 定数が定義されている
- AgentList の 2 つの zustand selector (`agents` / `worktrees`) が `?? EMPTY_AGENTS` / `?? EMPTY_WORKTREES` を使用している (`?? []` リテラルを使っていない)
- `src/features/worktrees/WorktreeList.tsx` のモジュールトップに `EMPTY_WORKTREES` 定数がある
- WorktreeList の zustand selector が `?? EMPTY_WORKTREES` を使用している
- `src/tabs/OverviewTab.tsx` の agentsForProject / worktreesForProject selector が stable な EMPTY 定数を使用している
- `src/components/ErrorBoundary.tsx` が存在し、`componentDidCatch` で例外を捕捉する React class component として実装されている
- `src/App.tsx` で `<WorkspaceRoute />` が ErrorBoundary でラップされている
- `pnpm tsc --noEmit` がエラーなし
- `pnpm build` がエラーなし (warning 許容)
- `agent-browser run --url "http://localhost:3099/?review=1"` で取得したスクショで、Workspace (Header / LeftSidebar / MainTabs / RightPanel / BottomDrawer) が描画されていることが目視で確認できる
- ブラウザコンソールに `Maximum update depth exceeded` や `The result of getSnapshot should be cached` のエラーが出ていない
