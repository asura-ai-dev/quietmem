# task-2C03: AgentCreateForm の status を select 化 (定数連携)

## Phase

2C

## Depends on

- task-2B01

## Goal

`src/features/agents/AgentCreateForm.tsx` の status `<input type="text">` を `<select>` に置き換え、`AGENT_STATUS_VALUES` を option として使う。デフォルトは `idle`。これにより UI 上で 4 値以外の status を入力する手段を物理的に排除する (spec.md §7.2)。

## Scope

- `src/features/agents/AgentCreateForm.tsx`
- `src/features/agents/AgentCreateForm.module.css` (`.select` クラスを追加)

## Implementation Notes

参照: `agent-docs/phase-2-ui-design.md` §3 status select 化

### 変更点

#### import 追加

```tsx
import type { Agent, AgentStatus } from "../../types/bindings";
import { AGENT_STATUS_LABELS, AGENT_STATUS_VALUES } from "./agentStatus";
```

#### state の型変更

```tsx
const [status, setStatus] = useState<AgentStatus>("idle");
```

(現状は `useState("")`。ローカルの `DEFAULT_STATUS = "idle"` 定数は削除して `"idle"` を直接 useState の初期値に使う)

#### status 入力部の変更

現状:

```tsx
<input
  id={statusId}
  type="text"
  className={styles.input}
  value={status}
  onChange={(e) => {
    setStatus(e.target.value);
    clearSubmitError();
  }}
  placeholder={DEFAULT_STATUS}
  aria-describedby={statusHintId}
/>
```

変更後:

```tsx
<select
  id={statusId}
  className={styles.select}
  value={status}
  onChange={(e) => {
    setStatus(e.target.value as AgentStatus);
    clearSubmitError();
  }}
  aria-describedby={statusHintId}
>
  {AGENT_STATUS_VALUES.map((v) => (
    <option key={v} value={v}>
      {AGENT_STATUS_LABELS[v]}
    </option>
  ))}
</select>
<span id={statusHintId} className={styles.hint}>
  作成直後の状態 (デフォルト: idle)
</span>
```

#### submit ロジックの変更

現状:

```tsx
const trimmedStatus = status.trim();
// ...
status: trimmedStatus.length > 0 ? trimmedStatus : DEFAULT_STATUS,
```

変更後:

```tsx
// status は select で必ず有効値が入っているため trim や fallback は不要
status,
```

#### resetForm の変更

```tsx
const resetForm = () => {
  setName("");
  setRole("");
  setAdapterType(DEFAULT_ADAPTER_TYPE);
  setPromptPath("");
  setConfigPath("");
  setStatus("idle"); // ← 変更 (元は "")
  setFieldErrors({});
};
```

### CSS 追加

`AgentCreateForm.module.css` に `.select` を追加:

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

(具体値は既存 `.input` を参考に揃える)

### 既存挙動の維持

- name / role / adapterType / promptPath / configPath のフィールドは変更しない
- バリデーションロジック (`validate()`) は status を含めない (select で有効値固定なので追加チェック不要)
- footer の submitError バナーはそのまま
- `onCreated(agent)` callback はそのまま

### 受け入れ条件 (spec.md §7.2)

- name / role / adapterType / status (4 値から選択) / promptPath / configPath を入力できる
- name が空のとき create はフロント検証で止まる (既存維持)
- status を 4 値以外に設定する手段が UI 上に存在しない (select 制限により物理的に不可能)

## Out of scope

- AgentEditForm の status select 化 (task-2C04)
- LeftSidebar 統合 (task-2C05)
- 複製ボタン (task-2D02)
- role / adapterType の enum 化 (QTM-009)
- placeholder テキストの大幅変更
