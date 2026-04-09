# Phase 2: UI 設計 (LeftSidebar 統合 / status バッジ / 複製確認)

## 概要

Phase 2 で必要な UI 変更を 4 つの領域に分けて設計する。

1. LeftSidebar Agents セクションの実 Agent 一覧化
2. AgentList の status バッジ強化
3. AgentCreateForm / AgentEditForm の status `<select>` 化
4. 複製確認 inline ダイアログ + tokens.css への color-danger 追加

## 仕様からの対応

- spec.md §2.1 フロントエンド層
- spec.md §4.1 / §4.2 / §4.3 / §4.4 / §4.5 / §4.6 / §4.7
- spec.md §7.1 / §7.2 / §7.3 / §7.4 / §7.5 / §7.6 受け入れ条件
- spec.md §11 想定ユーザーフロー
- spec.md §13.2 / §13.3 / §13.5 評価観点

---

## 1. LeftSidebar Agents セクション

### 現状 (Phase 1)

`src/shell/LeftSidebar.tsx` の `<section aria-label="Agents">` は placeholder
(`Agent 一覧は後続タスクで接続します`) を表示するだけ。

### Phase 2 後

```
+--------------------------------+
| LeftSidebar                    |
|  ┌── Projects ───────────────┐ |
|  │ [Project A]               │ |
|  │ [Project B] (selected)    │ |
|  └───────────────────────────┘ |
|  ┌── Agents ─────────────────┐ |
|  │ planner    [idle]         │ |
|  │ generator  [running]      │ |
|  │ evaluator  [needs input]  │ |
|  └───────────────────────────┘ |
+--------------------------------+
```

### 構造

- 親: `<section aria-label="Agents">`
- ヘッダ: `<h2>Agents</h2>`
- 空状態 (Project 未選択): `Project を選択してください` (既存維持)
- 空状態 (Agent 0 件): `Agent がまだありません`
- 一覧: `<ul>` 内に各 Agent を `<li><button></button></li>`
- 各行: `<button>` 内に `<span>name</span>` + `<AgentStatusBadge status={agent.status} />`
- click で `selectedAgentId` を更新 (uiStore 経由)
- 選択中: `aria-pressed="true"` + sage 系ハイライト

### データソース

- `useAgentStore((s) => s.agentsByProject[selectedProjectId] ?? EMPTY_AGENTS)`
- `useEffect` で `refreshAgents(selectedProjectId)` をマウント時 / Project 変更時に呼ぶ
  - **既存 OverviewTab 経由でも呼ばれているが、LeftSidebar 単体でも安全に呼ぶ**
  - zustand 無限ループ回避のため、安定参照 `EMPTY_AGENTS` constant を使う (Phase 1F の task-1F06 と同じパターン)

### LeftSidebar.module.css 追加

```
.agentList { /* ul */ }
.agentItem { /* li */ }
.agentItemButton { /* button */ }
.agentItemButtonSelected { /* aria-pressed=true */ }
.agentName { /* main label */ }
.agentBadgeWrapper { /* margin-left: auto */ }
```

raw 色値は使わず `var(--bg-surface-2)`, `var(--accent-primary)`, `var(--fg-muted)` を参照。

---

## 2. AgentList (Overview) の status バッジ強化

### 現状 (Phase 1)

`AgentList.tsx` は `<span data-status={agent.status}>{agent.status}</span>` で raw status 文字列を表示しているだけ。色付けはあるが 4 値のセマンティック区別は曖昧。

### Phase 2 後

各行に `<AgentStatusBadge status={agent.status} />` を配置する。共通コンポーネント化して LeftSidebar と AgentList の双方から使う。

### AgentStatusBadge コンポーネント (新規)

```tsx
// src/features/agents/AgentStatusBadge.tsx

import type { AgentStatus } from "../../types/bindings";
import { AGENT_STATUS_LABELS, AGENT_STATUS_VALUES } from "./agentStatus";
import styles from "./AgentStatusBadge.module.css";

interface Props {
  status: string;
  size?: "sm" | "md";
}

/**
 * 4 値 (idle / running / error / needs_input) を視覚的に区別するバッジ。
 * 色のみに依存せず、ラベルテキストでも状態名を読めることを保証する。
 * 範囲外値が来た場合は idle 相当の muted バッジでフォールバックする
 * (DB 互換性のためのエスケープハッチ)。
 */
function AgentStatusBadge({ status, size = "md" }: Props) {
  const known = AGENT_STATUS_VALUES.includes(status as AgentStatus);
  const variant = known ? (status as AgentStatus) : "idle";
  const label = known ? AGENT_STATUS_LABELS[variant] : status;
  return (
    <span
      className={`${styles.badge} ${styles[`badge_${variant}`]} ${styles[`size_${size}`]}`}
      data-status={variant}
      role="status"
      aria-label={`status: ${label}`}
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </span>
  );
}

export default AgentStatusBadge;
```

### スタイル方針 (AgentStatusBadge.module.css)

```
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-mono);
  border: 1px solid transparent;
}
.badge_idle {
  color: var(--fg-muted);
  background: rgba(0, 0, 0, 0.0); /* または subtle */
  border-color: var(--border-subtle);
}
.badge_running {
  color: var(--color-sage-50);
  background: var(--color-sage-700);
  border-color: var(--color-sage-500);
}
.badge_error {
  color: var(--color-gray-50);
  background: var(--color-danger);
  border-color: var(--color-danger-strong);
}
.badge_needs_input {
  color: var(--color-gray-900);
  background: var(--color-amber-300);
  border-color: var(--color-amber-500);
}
.dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
```

`needs_input` バリアントの CSS クラス名は `badge_needs_input` (アンダースコア区切り) で固定する。

### AgentList.tsx の差分

- `<span data-status>` を `<AgentStatusBadge status={agent.status} />` に置換
- 既存 `styles.itemStatus` クラスは削除可

---

## 3. AgentCreateForm / AgentEditForm の status select 化

### 共通方針

- `<input type="text">` を `<select>` に置換
- option は `AGENT_STATUS_VALUES` から map で生成
- 表示テキストは `AGENT_STATUS_LABELS[v]`
- value は enum 値 (`needs_input` 等)
- デフォルト: AgentCreateForm は `idle`、AgentEditForm は `agent.status` (既存値)

### AgentCreateForm.tsx

#### 変更前

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

#### 変更後

```tsx
<select
  id={statusId}
  className={styles.select}
  value={status || DEFAULT_STATUS}
  onChange={(e) => {
    setStatus(e.target.value);
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

#### 型変更

- `const [status, setStatus] = useState<AgentStatus>("idle");`
- submit payload: `status` を必ず送る (既存の `length > 0 ? status : DEFAULT_STATUS` 三項は削除)

### AgentEditForm.tsx

#### 変更前

```tsx
<input id={statusId} type="text" value={status} ... />
```

#### 変更後

```tsx
<select
  id={statusId}
  className={
    fieldErrors.status
      ? `${styles.select} ${styles.inputInvalid}`
      : styles.select
  }
  value={status}
  onChange={(e) => { setStatus(e.target.value as AgentStatus); ... }}
  aria-invalid={Boolean(fieldErrors.status)}
>
  {AGENT_STATUS_VALUES.map((v) => (
    <option key={v} value={v}>{AGENT_STATUS_LABELS[v]}</option>
  ))}
</select>
```

- `validate()` で status の `trim().length === 0` チェックは不要 (select で空文字を取り得ない)
- ただし型レベルで `AGENT_STATUS_VALUES.includes(status)` を念のため確認するヘルパは入れてもよい

### CSS

`AgentCreateForm.module.css` / `AgentEditForm.module.css` に `.select` クラスを追加 (既存 `.input` をベースに `appearance` と padding-right を調整)。

---

## 4. 複製ボタン + 確認 UI

### 配置場所

- **Primary**: AgentEditForm の formHeader 右側 (編集中の Agent を複製したい中心ユース)
- **Optional**: AgentList の各行 (時間があれば。Phase 2D 内では editForm 側を必須、List 側は分離チケットでもよい)

### 確認 UI 種別の選択

**inline ダイアログ** (modal ではなく、フォーム内に開閉する `<aside>`) を採用する。

理由:

- Phase 1 で modal の portal 基盤が無く、追加コストが大きい
- フォーム内に閉じたほうが Workspace Shell の grid を破壊しない
- ESC キーでの close は `useEffect` + `keydown` で実現可能 (アクセシビリティ)

### AgentDuplicateConfirm コンポーネント (新規)

```tsx
// src/features/agents/AgentDuplicateConfirm.tsx

import { useEffect, useId } from "react";
import type { Agent } from "../../types/bindings";
import styles from "./AgentDuplicateConfirm.module.css";

interface Props {
  agent: Agent;
  loading?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Agent の複製確認 inline ダイアログ。
 *
 * - 引き継がれる項目を明示
 * - 引き継がれない項目 (memory / active worktree / status) を警告色で明示
 * - キャンセル / 実行の 2 ボタン
 * - ESC キーでキャンセル
 *
 * 参照: agent-docs/phase-2-ui-design.md §4
 */
function AgentDuplicateConfirm({
  agent,
  loading,
  errorMessage,
  onCancel,
  onConfirm,
}: Props) {
  const headingId = useId();
  const descId = useId();

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onCancel]);

  return (
    <aside
      className={styles.root}
      role="alertdialog"
      aria-modal="false"
      aria-labelledby={headingId}
      aria-describedby={descId}
    >
      <header className={styles.header}>
        <h4 id={headingId} className={styles.title}>
          Agent を複製しますか?
        </h4>
      </header>
      <div id={descId} className={styles.body}>
        <p className={styles.intro}>
          <strong>{agent.name}</strong> をもとに新しい Agent を作成します。
        </p>
        <dl className={styles.list}>
          <dt className={styles.copy}>引き継がれる項目</dt>
          <dd>
            name (末尾に "(copy)") / role / adapter type / prompt path / config
            path
          </dd>
          <dt className={styles.skip}>引き継がれない項目</dt>
          <dd>
            Agent 固有の memory (raw / curated)、active worktree、status (idle
            で開始)
          </dd>
        </dl>
        {errorMessage && (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        )}
      </div>
      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.cancel}
          onClick={onCancel}
          disabled={loading}
        >
          キャンセル
        </button>
        <button
          type="button"
          className={styles.confirm}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "複製中…" : "複製を実行"}
        </button>
      </footer>
    </aside>
  );
}

export default AgentDuplicateConfirm;
```

### AgentEditForm への組み込み

```tsx
const [showDuplicate, setShowDuplicate] = useState(false);
const [dupError, setDupError] = useState<string | null>(null);
const duplicateAgent = useAgentStore((s) => s.duplicateAgent);
const setSelectedAgentId = useUiStore((s) => s.setSelectedAgentId);

const handleDuplicate = async () => {
  setDupError(null);
  try {
    const newAgent = await duplicateAgent({ sourceAgentId: agent.id });
    setShowDuplicate(false);
    setSelectedAgentId(newAgent.id); // 新 Agent を選択中にする
  } catch (err) {
    setDupError(toErrorMessage(err));
  }
};

// formHeader に <button onClick={() => setShowDuplicate(true)}>複製</button> を配置
// {showDuplicate && <AgentDuplicateConfirm ... />}
```

### スタイル (AgentDuplicateConfirm.module.css)

```
.root {
  margin-top: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-amber-500);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
}
.title { color: var(--fg-primary); font-size: var(--font-size-base); }
.copy { color: var(--accent-primary); }
.skip { color: var(--accent-attention); }
.error { color: var(--color-danger); }
.confirm { background: var(--color-amber-500); color: var(--color-gray-900); }
.cancel { background: var(--bg-surface-2); color: var(--fg-primary); }
```

---

## 5. tokens.css への追加

```css
/* tokens.css に追記 */

/* Danger (red) — Phase 2 で新規導入 */
--color-red-300: #f08a8a;
--color-red-500: #d04848;
--color-red-700: #8e2828;

/* Semantic alias */
--color-danger: var(--color-red-500);
--color-danger-strong: var(--color-red-700);
--color-danger-bg: var(--color-red-700);
```

raw 色値は新しい red パレットの 3 階調のみ。それ以外の場所では必ず `--color-danger` (alias) を経由する。

---

## 6. selectedAgentId の昇格 (uiStore)

### 現状 (Phase 1)

`OverviewTab.tsx` のローカル state (`useState<string|null>(null)`)。

### Phase 2 後

`uiStore.selectedAgentId` に昇格する。理由:

- LeftSidebar Agents セクションと OverviewTab の編集フォームが同じ id を共有する必要がある
- spec.md §13.2 「LeftSidebar の Agent 行と Overview タブの編集状態が連動しているか」

### uiStore 差分

```ts
export interface UiState {
  // ...
  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;
}

// 初期値: null
selectedAgentId: null,
setSelectedAgentId: (selectedAgentId) => set({ selectedAgentId }),
```

### Project 切り替え時のリセット

Project が変わったら別 project の Agent id を保持し続けないよう、`projectStore.selectProject` から `useUiStore.getState().setSelectedAgentId(null)` を呼ぶか、`OverviewTab` の `useEffect` で監視する。Phase 2 では **OverviewTab の useEffect 方式を継続** (Phase 1 と同じ) し、store 間の依存を増やさない。

### OverviewTab の差分

```tsx
const selectedAgentId = useUiStore((s) => s.selectedAgentId);
const setSelectedAgentId = useUiStore((s) => s.setSelectedAgentId);
// useState は削除
```

---

## 7. アクセシビリティ要件まとめ

| 対象                             | 要件                                                          |
| -------------------------------- | ------------------------------------------------------------- |
| AgentStatusBadge                 | `role="status"` + `aria-label="status: {label}"`              |
| AgentStatusBadge dot             | `aria-hidden="true"` (装飾)                                   |
| AgentDuplicateConfirm            | `role="alertdialog"` + `aria-labelledby` + `aria-describedby` |
| AgentDuplicateConfirm キャンセル | ESC キー対応                                                  |
| LeftSidebar Agent button         | `aria-pressed={isSelected}`                                   |
| status `<select>`                | 既存の `<label htmlFor=...>` を継続                           |
| 色のみ依存禁止                   | バッジは色 + dot + テキストで状態を区別                       |

---

## 8. 制約・注意事項

- 全コンポーネントは presentational + store 経由の構成を維持する (services を直接呼ばない)
- raw 色値の直書き禁止 (tokens.css の semantic alias を経由)
- zustand selector で配列を返すときは `EMPTY_AGENTS` 等の安定参照を使う (Phase 1F task-1F06 の回帰防止)
- AgentStatusBadge は LeftSidebar / AgentList / (将来) AgentEditForm / Header で再利用する想定
- 複製 UI の文言は spec.md §4.5 と完全一致させる (memory 非引継ぎ / status idle / active worktree 未割当)
- 既存テキスト (Phase 1 の placeholder) と矛盾するメッセージは残さない (cleanup 必須)
