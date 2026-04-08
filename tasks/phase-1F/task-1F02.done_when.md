# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/features/agents/AgentList.tsx` が存在
- `src/features/agents/AgentCreateForm.tsx` が存在
- AgentList が `agentStore.refreshAgents(projectId)` をマウント時に呼ぶ
- AgentCreateForm が `agentStore.createAgent` を呼び出す
- OverviewTab が選択中 projectId の有無で表示を切り替える
- `name`, `role`, `adapterType` 入力があり必須
- `pnpm tsc --noEmit` / `pnpm build` がエラーなし
