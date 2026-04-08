import { useEffect, useId, useState, type FormEvent } from "react";
import { useAgentStore } from "../../store/agentStore";
import type { Agent, Worktree } from "../../types/bindings";
import styles from "./AgentEditForm.module.css";

/**
 * AgentEditForm
 *
 * 指定の Agent を編集するフォーム。
 * 編集可能フィールド: name / role / adapterType / status / activeWorktreeId。
 *
 * `activeWorktreeId` は渡された `worktrees` 一覧から `<select>` で選択する。
 * 空文字選択肢 (—) を選ぶと `activeWorktreeId: null` として送信し、Agent と
 * Worktree の紐付けを解除できる。Worktree が 0 件の場合は select を disabled
 * にし、ヒントメッセージ (「Worktree を先に作成してください」) を表示する。
 *
 * submit で `agentStore.updateAgent({ id: agent.id, ... })` を呼び、
 * 成功後に `refreshAgents(agent.projectId)` で一覧を再取得する
 * (store 側の updateAgent が内部で refreshAgents を呼ぶので、このフォームでは
 *  明示的な二重呼び出しは不要。チケット仕様通り「保存後 refreshAgents」の
 *  意味は既に担保されている)。
 *
 * バリデーション方針 (AgentCreateForm と揃える):
 * - 必須: name / role / adapterType (空欄はフロントで先検出)
 * - status は空欄不可 (Agent 本体が既に status を持つため、空文字で上書きしない)
 * - Rust 側の InvalidInput / DB エラーは submit 後に footer バナーで表示
 *
 * 参照:
 * - agent-docs/ui-shell.md (Overview タブ内構成 / デザイントークン)
 * - agent-docs/tauri-commands.md (AgentUpdateInput / バリデーション方針)
 * - tasks/phase-1F/task-1F04.md
 * - spec.md §4.7 / §5.1 / §9 (Agent 編集フォームで activeWorktreeId を選択)
 */

interface AgentEditFormProps {
  agent: Agent;
  // readonly to accept stable empty-array constants from zustand selectors
  // (see OverviewTab.tsx EMPTY_WORKTREES). The form only reads from this list.
  worktrees: readonly Worktree[];
  onSaved?: (agent: Agent) => void;
}

interface FieldErrors {
  name?: string;
  role?: string;
  adapterType?: string;
  status?: string;
}

function AgentEditForm({ agent, worktrees, onSaved }: AgentEditFormProps) {
  const updateAgent = useAgentStore((state) => state.updateAgent);
  const loading = useAgentStore((state) => state.loading);
  const storeError = useAgentStore((state) => state.error);

  const nameId = useId();
  const roleId = useId();
  const adapterTypeId = useId();
  const statusId = useId();
  const activeWorktreeId = useId();
  const worktreeHintId = useId();

  const [name, setName] = useState(agent.name);
  const [role, setRole] = useState(agent.role);
  const [adapterType, setAdapterType] = useState(agent.adapterType);
  const [status, setStatus] = useState(agent.status);
  // select の値は常に string。null は空文字で表現する。
  const [activeWorktreeValue, setActiveWorktreeValue] = useState<string>(
    agent.activeWorktreeId ?? "",
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 親から別の agent が渡されたらフォーム state をリセットする
  // (AgentList で別の agent を選び直したケース)
  useEffect(() => {
    setName(agent.name);
    setRole(agent.role);
    setAdapterType(agent.adapterType);
    setStatus(agent.status);
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

  const hasWorktrees = worktrees.length > 0;

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (name.trim().length === 0) {
      errors.name = "Agent 名を入力してください";
    }
    if (role.trim().length === 0) {
      errors.role = "Role を入力してください";
    }
    if (adapterType.trim().length === 0) {
      errors.adapterType = "Adapter Type を入力してください";
    }
    if (status.trim().length === 0) {
      errors.status = "Status を入力してください";
    }
    return errors;
  };

  const clearSubmitError = () => {
    if (submitError !== null) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitError(null);

    try {
      const updated = await updateAgent({
        id: agent.id,
        name: name.trim(),
        role: role.trim(),
        adapterType: adapterType.trim(),
        status: status.trim(),
        // 空文字は null (紐付け解除) として送る
        activeWorktreeId:
          activeWorktreeValue.length > 0 ? activeWorktreeValue : null,
      });
      onSaved?.(updated);
    } catch (err) {
      const message =
        (err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : null) ??
        storeError ??
        "Agent の更新に失敗しました";
      setSubmitError(message);
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      aria-label="Agent edit form"
      noValidate
    >
      <header className={styles.formHeader}>
        <h3 className={styles.formTitle}>Edit Agent</h3>
        <span className={styles.formMeta}>id: {agent.id}</span>
      </header>

      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={nameId}>
            Agent 名
          </label>
          <input
            id={nameId}
            type="text"
            className={
              fieldErrors.name
                ? `${styles.input} ${styles.inputInvalid}`
                : styles.input
            }
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) {
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }
              clearSubmitError();
            }}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? `${nameId}-error` : undefined}
          />
          {fieldErrors.name && (
            <span id={`${nameId}-error`} className={styles.fieldError}>
              {fieldErrors.name}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={roleId}>
            Role
          </label>
          <input
            id={roleId}
            type="text"
            className={
              fieldErrors.role
                ? `${styles.input} ${styles.inputInvalid}`
                : styles.input
            }
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (fieldErrors.role) {
                setFieldErrors((prev) => ({ ...prev, role: undefined }));
              }
              clearSubmitError();
            }}
            aria-invalid={Boolean(fieldErrors.role)}
            aria-describedby={fieldErrors.role ? `${roleId}-error` : undefined}
          />
          {fieldErrors.role && (
            <span id={`${roleId}-error`} className={styles.fieldError}>
              {fieldErrors.role}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={adapterTypeId}>
            Adapter Type
          </label>
          <input
            id={adapterTypeId}
            type="text"
            className={
              fieldErrors.adapterType
                ? `${styles.input} ${styles.inputInvalid}`
                : styles.input
            }
            value={adapterType}
            onChange={(e) => {
              setAdapterType(e.target.value);
              if (fieldErrors.adapterType) {
                setFieldErrors((prev) => ({
                  ...prev,
                  adapterType: undefined,
                }));
              }
              clearSubmitError();
            }}
            aria-invalid={Boolean(fieldErrors.adapterType)}
            aria-describedby={
              fieldErrors.adapterType ? `${adapterTypeId}-error` : undefined
            }
          />
          {fieldErrors.adapterType && (
            <span id={`${adapterTypeId}-error`} className={styles.fieldError}>
              {fieldErrors.adapterType}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={statusId}>
            Status
          </label>
          <input
            id={statusId}
            type="text"
            className={
              fieldErrors.status
                ? `${styles.input} ${styles.inputInvalid}`
                : styles.input
            }
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              if (fieldErrors.status) {
                setFieldErrors((prev) => ({ ...prev, status: undefined }));
              }
              clearSubmitError();
            }}
            aria-invalid={Boolean(fieldErrors.status)}
            aria-describedby={
              fieldErrors.status ? `${statusId}-error` : undefined
            }
          />
          {fieldErrors.status && (
            <span id={`${statusId}-error`} className={styles.fieldError}>
              {fieldErrors.status}
            </span>
          )}
        </div>

        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label className={styles.label} htmlFor={activeWorktreeId}>
            Active Worktree
          </label>
          <select
            id={activeWorktreeId}
            className={styles.select}
            value={activeWorktreeValue}
            onChange={(e) => {
              setActiveWorktreeValue(e.target.value);
              clearSubmitError();
            }}
            disabled={!hasWorktrees}
            aria-describedby={worktreeHintId}
          >
            <option value="">— (未割当)</option>
            {worktrees.map((worktree) => (
              <option key={worktree.id} value={worktree.id}>
                {worktree.branchName} ({worktree.status})
              </option>
            ))}
          </select>
          <span id={worktreeHintId} className={styles.hint}>
            {hasWorktrees
              ? "空欄 (—) を選ぶと紐付けを解除します"
              : "Worktree がありません。Worktrees セクションで先に作成してください"}
          </span>
        </div>
      </div>

      <div className={styles.formFooter}>
        {submitError ? (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        ) : (
          <span />
        )}
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? "保存中…" : "変更を保存"}
        </button>
      </div>
    </form>
  );
}

export default AgentEditForm;
