# task-2C04: AgentEditForm の status を select 化

## Phase

2C

## Depends on

- task-2B01

## Goal

`src/features/agents/AgentEditForm.tsx` の status `<input type="text">` を `<select>` に置き換える。既存の編集フォームのバリデーション (`status.trim().length === 0` チェック) は不要になる。複製ボタンの追加は task-2D02 で行うため、本チケットでは触れない。

## Scope

- `src/features/agents/AgentEditForm.tsx`
- `src/features/agents/AgentEditForm.module.css` (`.select` クラス追加)

## Implementation Notes

参照: `agent-docs/phase-2-ui-design.md` §3 status select 化

### 変更点

#### import 追加

```tsx
import type { Agent, AgentStatus, Worktree } from "../../types/bindings";
import { AGENT_STATUS_LABELS, AGENT_STATUS_VALUES } from "./agentStatus";
```

#### state 型変更

```tsx
const [status, setStatus] = useState<AgentStatus>(agent.status as AgentStatus);
```

注意: `agent.status` は `AgentStatus | string` のユニオン。範囲外値の DB 行が来た場合に備えて、初期化時にフォールバックする:

```tsx
import { isAgentStatus } from "./agentStatus";

const initialStatus: AgentStatus = isAgentStatus(agent.status)
  ? agent.status
  : "idle";
const [status, setStatus] = useState<AgentStatus>(initialStatus);
```

#### useEffect (Agent 切り替え時の reset) の変更

```tsx
useEffect(() => {
  setName(agent.name);
  setRole(agent.role);
  setAdapterType(agent.adapterType);
  setStatus(
    isAgentStatus(agent.status) ? (agent.status as AgentStatus) : "idle",
  );
  setActiveWorktreeValue(agent.activeWorktreeId ?? "");
  setFieldErrors({});
  setSubmitError(null);
}, [
  agent.id,
  agent.name,
  agent.role,
  agent.adapterType,
  agent.status,
  agent.activeWorktreeId,
]);
```

#### status 入力部の変更

現状 (L259-L289) の `<input type="text">` ブロックを `<select>` に置換:

```tsx
<div className={styles.field}>
  <label className={styles.label} htmlFor={statusId}>
    Status
  </label>
  <select
    id={statusId}
    className={styles.select}
    value={status}
    onChange={(e) => {
      setStatus(e.target.value as AgentStatus);
      clearSubmitError();
    }}
  >
    {AGENT_STATUS_VALUES.map((v) => (
      <option key={v} value={v}>
        {AGENT_STATUS_LABELS[v]}
      </option>
    ))}
  </select>
</div>
```

#### validate() の変更

`status` のチェックを削除:

```tsx
const validate = (): FieldErrors => {
  const errors: FieldErrors = {};
  if (name.trim().length === 0) errors.name = "Agent 名を入力してください";
  if (role.trim().length === 0) errors.role = "Role を入力してください";
  if (adapterType.trim().length === 0)
    errors.adapterType = "Adapter Type を入力してください";
  // status のチェックは削除 (select で必ず有効値が入る)
  return errors;
};
```

`FieldErrors` interface から `status?: string` フィールドを削除:

```tsx
interface FieldErrors {
  name?: string;
  role?: string;
  adapterType?: string;
  // status は削除
}
```

#### submit ロジックの変更

```tsx
const updated = await updateAgent({
  id: agent.id,
  name: name.trim(),
  role: role.trim(),
  adapterType: adapterType.trim(),
  status, // ← .trim() 不要 (有効値固定)
  activeWorktreeId: activeWorktreeValue.length > 0 ? activeWorktreeValue : null,
});
```

### CSS 追加

`AgentEditForm.module.css` に `.select` クラスを追加:

```css
.select {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-surface);
  color: var(--fg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  appearance: auto;
}

.select:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 1px;
}
```

(既存の `.input` を流用しても OK)

### 受け入れ条件

- spec.md §7.3 編集フォームから status を 4 値から選択できる
- spec.md §7.5 status を 4 値以外に設定する手段が UI 上に存在しない
- 別 Agent 選択時にフォーム state が新 agent の status で初期化される (既存挙動維持)

### 既存 ActiveWorktree select は維持

- `<select>` の二重実装にならないよう、`status` と `activeWorktreeId` の両 select が共存することを確認
- CSS クラス名 `.select` は両方が共有してよい

## Out of scope

- 複製ボタンの追加 (task-2D02)
- name / role / adapterType の入力変更
- バリデーションの根本見直し
- AgentCreateForm 側 (task-2C03)
