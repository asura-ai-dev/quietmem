# task-2C03 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/features/agents/AgentCreateForm.tsx` の status 入力部が `<select>` に置き換わっている
  - `grep -n '<select' src/features/agents/AgentCreateForm.tsx` でヒット
- 旧 `<input id={statusId} type="text"` の status 入力が削除されている
- `AGENT_STATUS_VALUES` を import している
  - `grep -n 'AGENT_STATUS_VALUES' src/features/agents/AgentCreateForm.tsx` でヒット
- `AGENT_STATUS_LABELS` を使って option ラベルを表示している
- `useState<AgentStatus>("idle")` または `useState<AgentStatus>` 相当の型注釈で status の初期値が `"idle"`
- option が `AGENT_STATUS_VALUES.map((v) => <option ...>)` で生成されている
- submit ペイロードで `status` が必ず送信される (有効値固定なので fallback 不要)
- resetForm で `setStatus("idle")` (または初期値) に戻している
- `AgentCreateForm.module.css` に `.select` クラスが追加されている (既存 `.input` 相当の見た目)
- `pnpm tsc --noEmit` が exit 0
- `pnpm build` が success
- 既存の name / role / adapterType / promptPath / configPath フィールドが破壊されていない
