# task-2C01 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/features/agents/AgentStatusBadge.tsx` ファイルが新規作成されている
- `src/features/agents/AgentStatusBadge.module.css` ファイルが新規作成されている
- `AgentStatusBadge` コンポーネントが default export されている
- props 型に `status: string` と optional な `size?: "sm" | "md"` がある
- 内部で `isAgentStatus(status)` を呼び出して範囲外値をフォールバックしている
- `role="status"` 属性を持つ
- `aria-label` 属性に status のラベルテキストが含まれる
- ドット要素 (`<span aria-hidden="true">`) が存在する
- ラベルテキスト (`AGENT_STATUS_LABELS[variant]`) が表示される
- CSS module に 4 バリアント (`badge_idle` / `badge_running` / `badge_error` / `badge_needs_input`) が定義されている
- CSS module 内で raw 色値 (`#`) が `tokens.css` 経由でない直書きとして存在しない
  - `grep -E '#[0-9a-fA-F]{3,6}' src/features/agents/AgentStatusBadge.module.css` がヒットしない (もしくは tokens.css のコメントレベル)
- `pnpm tsc --noEmit` が exit 0
- `pnpm build` が success
