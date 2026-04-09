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
 * - 引き継がれる項目を sage 系で明示
 * - 引き継がれない項目 (memory / active worktree / status) を amber 系で警告
 * - キャンセル / 実行の 2 ボタン
 * - ESC キーでキャンセル (アクセシビリティ)
 *
 * Modal portal を使わず AgentEditForm 内に inline 展開する。
 * 文言は spec.md §4.5 と完全一致させること。
 *
 * 参照:
 * - agent-docs/spec.md §4.5
 * - agent-docs/phase-2-ui-design.md §4
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
        <span className={styles.eyebrow} aria-hidden="true">
          confirm / duplicate
        </span>
        <h4 id={headingId} className={styles.title}>
          Agent を複製しますか?
        </h4>
      </header>
      <div id={descId} className={styles.body}>
        <p className={styles.intro}>
          <strong className={styles.agentName}>{agent.name}</strong>{" "}
          をもとに新しい Agent を作成します。
        </p>
        <dl className={styles.list}>
          <dt className={styles.copy}>
            <span className={styles.markerCopy} aria-hidden="true" />
            引き継がれる項目
          </dt>
          <dd className={styles.copyDesc}>
            name (末尾に &quot;(copy)&quot;)、role、adapter type、prompt
            path、config path
          </dd>
          <dt className={styles.skip}>
            <span className={styles.markerSkip} aria-hidden="true" />
            引き継がれない項目
          </dt>
          <dd className={styles.skipDesc}>
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
