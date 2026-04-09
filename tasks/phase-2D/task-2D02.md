# task-2D02: AgentEditForm に複製ボタン + Confirm 統合

## Phase

2D

## Depends on

- task-2D01
- task-2C04

## Goal

`src/features/agents/AgentEditForm.tsx` の formHeader 右側に「複製」ボタンを追加し、押下で `AgentDuplicateConfirm` を inline 表示する。確認 UI で「複製を実行」を選んだら `agentStore.duplicateAgent({ sourceAgentId: agent.id })` を呼び、成功時に新 Agent を `uiStore.setSelectedAgentId` に切り替える (新 Agent が編集対象になる)。

## Scope

- `src/features/agents/AgentEditForm.tsx`
- `src/features/agents/AgentEditForm.module.css` (`.duplicateButton` クラス追加)

## Implementation Notes

参照: `agent-docs/phase-2-ui-design.md` §4 / §AgentEditForm への組み込み

### import 拡張

```tsx
import AgentDuplicateConfirm from "./AgentDuplicateConfirm";
import { useUiStore } from "../../store/uiStore";
```

### state 追加

```tsx
const [showDuplicate, setShowDuplicate] = useState(false);
const [dupLoading, setDupLoading] = useState(false);
const [dupError, setDupError] = useState<string | null>(null);

const duplicateAgent = useAgentStore((s) => s.duplicateAgent);
const setSelectedAgentId = useUiStore((s) => s.setSelectedAgentId);
```

### handler

```tsx
const handleDuplicateClick = () => {
  setDupError(null);
  setShowDuplicate(true);
};

const handleDuplicateCancel = () => {
  if (dupLoading) return;
  setShowDuplicate(false);
  setDupError(null);
};

const handleDuplicateConfirm = async () => {
  setDupLoading(true);
  setDupError(null);
  try {
    const newAgent = await duplicateAgent({ sourceAgentId: agent.id });
    setShowDuplicate(false);
    // 新 Agent を編集対象に切り替える
    setSelectedAgentId(newAgent.id);
  } catch (err) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message?: unknown }).message)
        : "Agent の複製に失敗しました";
    setDupError(message);
  } finally {
    setDupLoading(false);
  }
};
```

### formHeader への複製ボタン追加

現状:

```tsx
<header className={styles.formHeader}>
  <h3 className={styles.formTitle}>Edit Agent</h3>
  <span className={styles.formMeta}>id: {agent.id}</span>
</header>
```

変更後:

```tsx
<header className={styles.formHeader}>
  <h3 className={styles.formTitle}>Edit Agent</h3>
  <div className={styles.formHeaderActions}>
    <span className={styles.formMeta}>id: {agent.id}</span>
    <button
      type="button"
      className={styles.duplicateButton}
      onClick={handleDuplicateClick}
      disabled={loading || dupLoading}
      aria-label={`${agent.name} を複製`}
    >
      複製
    </button>
  </div>
</header>
```

### Confirm の表示

formFooter の **下** (form 要素の閉じタグ直前) または formFooter の **上** に以下を追加:

```tsx
{
  showDuplicate && (
    <AgentDuplicateConfirm
      agent={agent}
      loading={dupLoading}
      errorMessage={dupError}
      onCancel={handleDuplicateCancel}
      onConfirm={handleDuplicateConfirm}
    />
  );
}
```

position は formFooter の上に置くと「複製ボタン → Confirm → submit ボタン」の視線誘導になり自然。

### CSS 追加 (AgentEditForm.module.css)

```css
.formHeaderActions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.duplicateButton {
  padding: var(--space-1) var(--space-3);
  background: transparent;
  color: var(--accent-attention);
  border: 1px solid var(--accent-attention);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  cursor: pointer;
  font-weight: 500;
}

.duplicateButton:hover:not(:disabled) {
  background: var(--accent-attention);
  color: var(--color-gray-900);
}

.duplicateButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Project 切り替え時のクリーンアップ

agent.id が変わったら確認 UI を閉じる。既存の useEffect (`agent.id` を依存に含む) を拡張する:

```tsx
useEffect(() => {
  setName(agent.name);
  // ... 既存の reset ...
  setShowDuplicate(false);
  setDupError(null);
  setDupLoading(false);
}, [
  agent.id,
  agent.name,
  agent.role,
  agent.adapterType,
  agent.status,
  agent.activeWorktreeId,
]);
```

### 既存 submit ロジックは保持

- 通常の `handleSubmit` は変更しない (status select 化は task-2C04 で完了済み)
- duplicate と通常 submit は独立して動く

### エラー文言

- duplicate 失敗時のメッセージは confirm UI 内に表示する (formFooter の submitError とは別)
- これにより通常の編集失敗メッセージと混在しない

## Out of scope

- AgentList 行内の複製ボタン (Phase 2 では editForm 側のみ実装)
- 複製後に新 Agent の編集フォームへ自動切り替えるアニメーション
- 複製名のユーザー入力 UI (Phase 2 では `<元 name> (copy)` 固定)
- name の collision 検出 (UNIQUE 制約なし)
- 複製のキャンセル後のアンドゥ (不要)
