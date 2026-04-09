# task-2C04 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/features/agents/AgentEditForm.tsx` の status 入力部が `<select>` になっている
  - `grep -n 'AGENT_STATUS_VALUES' src/features/agents/AgentEditForm.tsx` でヒット
  - status 入力部の `<input id={statusId} type="text"` が削除されている
- import に `AgentStatus` 型と `AGENT_STATUS_LABELS` / `AGENT_STATUS_VALUES` / `isAgentStatus` が含まれている
- state 初期化時に `isAgentStatus(agent.status)` を使ってフォールバックしている (範囲外値対策)
- useEffect 内で agent 切り替え時の status 再代入も同じフォールバックを使っている
- `validate()` から status のチェックが削除されている
- `FieldErrors` インターフェースから `status?: string` フィールドが削除されている (status select は常に有効値)
- `AgentEditForm.module.css` に `.select` クラスが定義されている
- 既存の Active Worktree select は引き続き存在する
- `pnpm tsc --noEmit` が exit 0
- `pnpm build` が success
- 既存の name / role / adapterType / activeWorktreeId 入力が破壊されていない
